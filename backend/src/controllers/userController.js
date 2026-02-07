import * as userService from '../services/userService.js';
import ApiResponse from '../utils/ApiResponse.js';

export const listUsers = async (req, res, next) => {
  try {
    const result = await userService.listUsers(req.query);
    ApiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    ApiResponse.success(res, { user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(
      req.params.id,
      req.body,
      req.user.userId,
      req.user.role
    );
    ApiResponse.success(res, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    await userService.changePassword(
      req.user.userId,
      req.body.currentPassword,
      req.body.newPassword
    );
    ApiResponse.success(res, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

export const deactivateUser = async (req, res, next) => {
  try {
    const user = await userService.deactivateUser(req.params.id);
    ApiResponse.success(res, { user }, 'User deactivated');
  } catch (error) {
    next(error);
  }
};

export const reactivateUser = async (req, res, next) => {
  try {
    const user = await userService.reactivateUser(req.params.id);
    ApiResponse.success(res, { user }, 'User reactivated');
  } catch (error) {
    next(error);
  }
};

export const getUserAchievements = async (req, res, next) => {
  try {
    const achievements = await userService.getUserAchievements(req.params.id);
    ApiResponse.success(res, { achievements });
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (req, res, next) => {
  try {
    const stats = await userService.getUserStats(req.params.id);
    ApiResponse.success(res, { stats });
  } catch (error) {
    next(error);
  }
};
