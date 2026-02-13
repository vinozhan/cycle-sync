import * as reviewService from '../services/reviewService.js';
import ApiResponse from '../utils/ApiResponse.js';

export const create = async (req, res, next) => {
  try {
    const review = await reviewService.create(req.body, req.user.userId);
    ApiResponse.created(res, { review }, 'Review submitted successfully');
  } catch (error) {
    next(error);
  }
};

export const list = async (req, res, next) => {
  try {
    const result = await reviewService.list(req.query);
    ApiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const review = await reviewService.getById(req.params.id);
    ApiResponse.success(res, { review });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const review = await reviewService.update(req.params.id, req.body, req.user.userId);
    ApiResponse.success(res, { review }, 'Review updated successfully');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await reviewService.remove(req.params.id, req.user.userId, req.user.role);
    ApiResponse.success(res, null, 'Review deleted successfully');
  } catch (error) {
    next(error);
  }
};
