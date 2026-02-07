import * as routeService from '../services/routeService.js';
import { getCyclingWeather } from '../services/weatherService.js';
import ApiResponse from '../utils/ApiResponse.js';

export const create = async (req, res, next) => {
  try {
    const route = await routeService.create(req.body, req.user.userId);
    ApiResponse.created(res, { route }, 'Route created successfully');
  } catch (error) {
    next(error);
  }
};

export const list = async (req, res, next) => {
  try {
    const result = await routeService.list(req.query);
    ApiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const route = await routeService.getById(req.params.id);
    ApiResponse.success(res, { route });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const route = await routeService.update(
      req.params.id,
      req.body,
      req.user.userId,
      req.user.role
    );
    ApiResponse.success(res, { route }, 'Route updated successfully');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await routeService.remove(req.params.id, req.user.userId, req.user.role);
    ApiResponse.success(res, null, 'Route deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const verify = async (req, res, next) => {
  try {
    const route = await routeService.verify(req.params.id);
    ApiResponse.success(res, { route }, 'Route verified successfully');
  } catch (error) {
    next(error);
  }
};

export const getWeather = async (req, res, next) => {
  try {
    const route = await routeService.getById(req.params.id);
    const weather = await getCyclingWeather(
      route.startPoint.lat,
      route.startPoint.lng
    );
    ApiResponse.success(res, { weather });
  } catch (error) {
    next(error);
  }
};

export const getNearby = async (req, res, next) => {
  try {
    const { lat, lng, maxDistance } = req.query;
    if (!lat || !lng) {
      return ApiResponse.success(res, { items: [], pagination: {} });
    }
    const result = await routeService.getNearby(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(maxDistance) || 10,
      req.query
    );
    ApiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};
