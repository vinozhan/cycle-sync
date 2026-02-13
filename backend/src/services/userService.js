import User from '../models/User.js';
import Route from '../models/Route.js';
import Report from '../models/Report.js';
import Review from '../models/Review.js';
import Ride from '../models/Ride.js';
import ApiError from '../utils/ApiError.js';
import { buildPagination, paginateResult } from '../utils/pagination.js';

export const listUsers = async (queryParams) => {
  const { page, limit, skip, sort } = buildPagination(queryParams);
  const filter = {};

  if (queryParams.role) {
    filter.role = queryParams.role;
  }

  if (queryParams.search) {
    filter.$text = { $search: queryParams.search };
  }

  if (queryParams.isActive !== undefined) {
    filter.isActive = queryParams.isActive === 'true';
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return paginateResult(users, total, page, limit);
};

export const getUserById = async (id) => {
  const user = await User.findById(id).populate('achievements');
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
};

export const updateUser = async (id, updateData, requestingUserId, requestingRole) => {
  if (id.toString() !== requestingUserId.toString() && requestingRole !== 'admin') {
    throw ApiError.forbidden('You can only update your own profile');
  }

  if (updateData.role && requestingRole !== 'admin') {
    delete updateData.role;
  }

  delete updateData.password;
  delete updateData.email;
  delete updateData.refreshToken;
  delete updateData.totalDistance;
  delete updateData.totalPoints;
  delete updateData.achievements;
  delete updateData.currentStreak;
  delete updateData.longestStreak;
  delete updateData.lastRideDate;

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate('achievements');

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
};

export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  user.password = newPassword;
  user.refreshToken = null;
  await user.save();
};

export const deactivateUser = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  if (user.role === 'admin') {
    throw ApiError.badRequest('Cannot deactivate an admin account');
  }

  user.isActive = false;
  user.refreshToken = null;
  await user.save();
  return user;
};

export const reactivateUser = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  user.isActive = true;
  await user.save();
  return user;
};

export const getUserAchievements = async (id) => {
  const user = await User.findById(id).populate('achievements');
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user.achievements;
};

export const getUserStats = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const [routeCount, reportCount, reviewCount, rideAgg] = await Promise.all([
    Route.countDocuments({ createdBy: id, isActive: true }),
    Report.countDocuments({ reportedBy: id }),
    Review.countDocuments({ reviewer: id }),
    Ride.aggregate([
      { $match: { user: user._id, status: 'completed', isActive: true } },
      { $group: { _id: null, count: { $sum: 1 }, co2: { $sum: '$co2Saved' } } },
    ]),
  ]);

  const rideStat = rideAgg[0] || { count: 0, co2: 0 };

  // Compute live display streak: reset to 0 if last ride was more than 1 day ago
  let displayStreak = user.currentStreak || 0;
  if (user.lastRideDate) {
    const now = new Date();
    const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const last = new Date(user.lastRideDate);
    const lastUTC = Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate());
    const diffDays = Math.round((todayUTC - lastUTC) / (1000 * 60 * 60 * 24));
    if (diffDays > 1) displayStreak = 0;
  }

  return {
    totalDistance: user.totalDistance,
    totalPoints: user.totalPoints,
    routesCreated: routeCount,
    reportsSubmitted: reportCount,
    reviewsWritten: reviewCount,
    ridesCompleted: rideStat.count,
    co2Saved: rideStat.co2,
    achievementCount: user.achievements.length,
    memberSince: user.createdAt,
    currentStreak: displayStreak,
    longestStreak: user.longestStreak || 0,
  };
};
