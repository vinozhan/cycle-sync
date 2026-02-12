import * as rideService from '../services/rideService.js';
import ApiResponse from '../utils/ApiResponse.js';

export const start = async (req, res, next) => {
  try {
    const ride = await rideService.startRide(req.body.route, req.user.userId);
    ApiResponse.created(res, { ride }, 'Ride started successfully');
  } catch (error) {
    next(error);
  }
};

export const complete = async (req, res, next) => {
  try {
    const ride = await rideService.completeRide(req.params.id, req.user.userId);
    ApiResponse.success(res, { ride }, 'Ride completed successfully');
  } catch (error) {
    next(error);
  }
};

export const cancel = async (req, res, next) => {
  try {
    const ride = await rideService.cancelRide(req.params.id, req.user.userId);
    ApiResponse.success(res, { ride }, 'Ride cancelled');
  } catch (error) {
    next(error);
  }
};

export const list = async (req, res, next) => {
  try {
    const result = await rideService.list(req.query, req.user.userId);
    ApiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const ride = await rideService.getById(req.params.id, req.user.userId);
    ApiResponse.success(res, { ride });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await rideService.getStats(req.user.userId);
    ApiResponse.success(res, { stats });
  } catch (error) {
    next(error);
  }
};

export const getActiveRide = async (req, res, next) => {
  try {
    const ride = await rideService.getActiveRide(req.user.userId);
    ApiResponse.success(res, { ride });
  } catch (error) {
    next(error);
  }
};
