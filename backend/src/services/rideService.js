import mongoose from 'mongoose';
import Ride from '../models/Ride.js';
import Route from '../models/Route.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { buildPagination, paginateResult } from '../utils/pagination.js';
import { POINTS, CO2_PER_KM } from '../utils/constants.js';
import { checkAndGrantRewards } from './rewardService.js';

export const startRide = async (routeId, userId) => {
  const existingActive = await Ride.findOne({
    user: userId,
    status: 'active',
    isActive: true,
  });

  if (existingActive) {
    throw ApiError.conflict('You already have an active ride');
  }

  const route = await Route.findById(routeId);
  if (!route || !route.isActive) {
    throw ApiError.notFound('Route not found');
  }

  const ride = await Ride.create({
    user: userId,
    route: routeId,
    createdBy: userId,
    status: 'active',
    startedAt: new Date(),
  });

  const populated = await Ride.findById(ride._id)
    .populate('route', 'title distance')
    .populate('user', 'firstName lastName');

  return populated;
};

export const completeRide = async (rideId, userId) => {
  const ride = await Ride.findById(rideId);

  if (!ride || !ride.isActive) {
    throw ApiError.notFound('Ride not found');
  }

  if (ride.user.toString() !== userId) {
    throw ApiError.forbidden('Not authorized to complete this ride');
  }

  if (ride.status !== 'active') {
    throw ApiError.badRequest('Ride is not active');
  }

  const route = await Route.findById(ride.route);
  const distance = route?.distance || 0;
  const duration = parseFloat(((Date.now() - ride.startedAt.getTime()) / 60000).toFixed(2));
  const co2Saved = parseFloat((distance * CO2_PER_KM).toFixed(2));

  ride.status = 'completed';
  ride.completedAt = new Date();
  ride.duration = duration;
  ride.distance = distance;
  ride.co2Saved = co2Saved;
  ride.pointsEarned = POINTS.RIDE_COMPLETED;
  await ride.save();

  await User.findByIdAndUpdate(userId, {
    $inc: {
      totalPoints: POINTS.RIDE_COMPLETED,
      totalDistance: distance,
    },
  });

  try {
    await checkAndGrantRewards(userId);
  } catch {
    // Silent failure for reward check
  }

  const populated = await Ride.findById(ride._id)
    .populate('route', 'title distance')
    .populate('user', 'firstName lastName');

  return populated;
};

export const cancelRide = async (rideId, userId) => {
  const ride = await Ride.findById(rideId);

  if (!ride || !ride.isActive) {
    throw ApiError.notFound('Ride not found');
  }

  if (ride.user.toString() !== userId) {
    throw ApiError.forbidden('Not authorized to cancel this ride');
  }

  if (ride.status !== 'active') {
    throw ApiError.badRequest('Only active rides can be cancelled');
  }

  ride.status = 'cancelled';
  await ride.save();

  return ride;
};

export const list = async (queryParams, userId) => {
  const { page, limit, skip, sort } = buildPagination(queryParams);
  const filter = { user: userId, isActive: true };

  if (queryParams.status) {
    filter.status = queryParams.status;
  }

  const [rides, total] = await Promise.all([
    Ride.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('route', 'title distance'),
    Ride.countDocuments(filter),
  ]);

  return paginateResult(rides, total, page, limit);
};

export const getById = async (rideId, userId) => {
  const ride = await Ride.findById(rideId)
    .populate('route', 'title distance')
    .populate('user', 'firstName lastName');

  if (!ride || !ride.isActive) {
    throw ApiError.notFound('Ride not found');
  }

  if (ride.user._id.toString() !== userId) {
    throw ApiError.forbidden('Not authorized to view this ride');
  }

  return ride;
};

export const getStats = async (userId) => {
  const result = await Ride.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), status: 'completed', isActive: true } },
    {
      $group: {
        _id: null,
        ridesCompleted: { $sum: 1 },
        totalDistance: { $sum: '$distance' },
        totalCo2Saved: { $sum: '$co2Saved' },
        totalDuration: { $sum: '$duration' },
      },
    },
  ]);

  if (result.length === 0) {
    return { ridesCompleted: 0, totalDistance: 0, totalCo2Saved: 0, totalDuration: 0 };
  }

  const { ridesCompleted, totalDistance, totalCo2Saved, totalDuration } = result[0];
  return { ridesCompleted, totalDistance, totalCo2Saved, totalDuration };
};

export const getActiveRide = async (userId) => {
  const ride = await Ride.findOne({
    user: userId,
    status: 'active',
    isActive: true,
  })
    .populate('route', 'title distance')
    .populate('user', 'firstName lastName');

  return ride;
};
