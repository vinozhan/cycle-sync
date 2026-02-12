import Route from '../models/Route.js';
import ApiError from '../utils/ApiError.js';
import { buildPagination, paginateResult } from '../utils/pagination.js';
import openRouteServiceClient from './openRouteService.js';

export const create = async (routeData, userId) => {
  routeData.createdBy = userId;

  // Skip ORS call if polyline already provided (e.g. from preview)
  if (!routeData.polyline) {
    const coordinates = [
      [routeData.startPoint.lng, routeData.startPoint.lat],
      ...(routeData.waypoints || []).map((wp) => [wp.lng, wp.lat]),
      [routeData.endPoint.lng, routeData.endPoint.lat],
    ];

    const orsData = await openRouteServiceClient.getDirections(coordinates);
    if (orsData) {
      routeData.distance = orsData.distance;
      routeData.estimatedDuration = orsData.duration;
      routeData.elevationGain = orsData.elevationGain;
      routeData.polyline = orsData.polyline;
    }
  }

  const route = await Route.create(routeData);
  return route.populate('createdBy', 'firstName lastName avatar');
};

export const preview = async (start, end) => {
  const coordinates = [
    [start.lng, start.lat],
    [end.lng, end.lat],
  ];

  const orsData = await openRouteServiceClient.getDirections(coordinates);
  if (orsData) {
    return orsData;
  }

  // Fallback: Haversine straight-line distance
  const R = 6371;
  const dLat = ((end.lat - start.lat) * Math.PI) / 180;
  const dLng = ((end.lng - start.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((start.lat * Math.PI) / 180) *
      Math.cos((end.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = parseFloat((R * c).toFixed(2));

  return {
    distance,
    duration: parseFloat(((distance / 15) * 60).toFixed(1)),
    elevationGain: 0,
    polyline: '',
  };
};

export const list = async (queryParams) => {
  const { page, limit, skip, sort } = buildPagination(queryParams);
  const filter = { isActive: true };

  if (queryParams.difficulty) {
    filter.difficulty = queryParams.difficulty;
  }

  if (queryParams.surfaceType) {
    filter.surfaceType = queryParams.surfaceType;
  }

  if (queryParams.minDistance || queryParams.maxDistance) {
    filter.distance = {};
    if (queryParams.minDistance) filter.distance.$gte = parseFloat(queryParams.minDistance);
    if (queryParams.maxDistance) filter.distance.$lte = parseFloat(queryParams.maxDistance);
  }

  if (queryParams.minRating) {
    filter.averageRating = { $gte: parseFloat(queryParams.minRating) };
  }

  if (queryParams.isVerified === 'true') {
    filter.isVerified = true;
  }

  if (queryParams.city) {
    filter.city = new RegExp(queryParams.city, 'i');
  }

  if (queryParams.search) {
    filter.$text = { $search: queryParams.search };
  }

  const [routes, total] = await Promise.all([
    Route.find(filter)
      .populate('createdBy', 'firstName lastName avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Route.countDocuments(filter),
  ]);

  return paginateResult(routes, total, page, limit);
};

export const getById = async (id) => {
  const route = await Route.findById(id).populate('createdBy', 'firstName lastName avatar');
  if (!route || !route.isActive) {
    throw ApiError.notFound('Route not found');
  }
  return route;
};

export const update = async (id, updateData, userId, userRole) => {
  const route = await Route.findById(id);
  if (!route || !route.isActive) {
    throw ApiError.notFound('Route not found');
  }

  if (route.createdBy.toString() !== userId && userRole !== 'admin') {
    throw ApiError.forbidden('You can only update your own routes');
  }

  delete updateData.createdBy;
  delete updateData.averageRating;
  delete updateData.reviewCount;
  delete updateData.isVerified;
  delete updateData.isActive;

  Object.assign(route, updateData);
  await route.save();
  return route.populate('createdBy', 'firstName lastName avatar');
};

export const remove = async (id, userId, userRole) => {
  const route = await Route.findById(id);
  if (!route || !route.isActive) {
    throw ApiError.notFound('Route not found');
  }

  if (route.createdBy.toString() !== userId && userRole !== 'admin') {
    throw ApiError.forbidden('You can only delete your own routes');
  }

  route.isActive = false;
  await route.save();
};

export const verify = async (id) => {
  const route = await Route.findById(id);
  if (!route || !route.isActive) {
    throw ApiError.notFound('Route not found');
  }

  route.isVerified = true;
  await route.save();
  return route;
};

export const getNearby = async (lat, lng, maxDistanceKm = 10, queryParams = {}) => {
  const { page, limit, skip } = buildPagination(queryParams);

  const degreeRange = maxDistanceKm / 111;
  const filter = {
    isActive: true,
    'startPoint.lat': { $gte: lat - degreeRange, $lte: lat + degreeRange },
    'startPoint.lng': { $gte: lng - degreeRange, $lte: lng + degreeRange },
  };

  const [routes, total] = await Promise.all([
    Route.find(filter)
      .populate('createdBy', 'firstName lastName avatar')
      .skip(skip)
      .limit(limit),
    Route.countDocuments(filter),
  ]);

  return paginateResult(routes, total, page, limit);
};
