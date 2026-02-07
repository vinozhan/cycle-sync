import * as rewardService from '../services/rewardService.js';
import ApiResponse from '../utils/ApiResponse.js';

export const create = async (req, res, next) => {
  try {
    const reward = await rewardService.create(req.body);
    ApiResponse.created(res, { reward }, 'Reward created successfully');
  } catch (error) {
    next(error);
  }
};

export const list = async (req, res, next) => {
  try {
    const result = await rewardService.list(req.query);
    ApiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const reward = await rewardService.getById(req.params.id);
    ApiResponse.success(res, { reward });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const reward = await rewardService.update(req.params.id, req.body);
    ApiResponse.success(res, { reward }, 'Reward updated successfully');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await rewardService.remove(req.params.id);
    ApiResponse.success(res, null, 'Reward deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const checkRewards = async (req, res, next) => {
  try {
    const result = await rewardService.checkAndGrantRewards(req.params.userId);
    ApiResponse.success(res, result, `${result.granted.length} new reward(s) granted`);
  } catch (error) {
    next(error);
  }
};
