import Reward from '../models/Reward.js';
import User from '../models/User.js';
import Route from '../models/Route.js';
import Report from '../models/Report.js';
import Review from '../models/Review.js';
import Ride from '../models/Ride.js';
import ApiError from '../utils/ApiError.js';
import { buildPagination, paginateResult } from '../utils/pagination.js';

export const create = async (rewardData) => {
  const reward = await Reward.create(rewardData);
  return reward;
};

export const list = async (queryParams) => {
  const { page, limit, skip, sort } = buildPagination(queryParams);
  const filter = { isActive: true };

  if (queryParams.category) {
    filter.category = queryParams.category;
  }

  if (queryParams.tier) {
    filter.tier = queryParams.tier;
  }

  const [rewards, total] = await Promise.all([
    Reward.find(filter).sort(sort).skip(skip).limit(limit),
    Reward.countDocuments(filter),
  ]);

  return paginateResult(rewards, total, page, limit);
};

export const getById = async (id) => {
  const reward = await Reward.findById(id);
  if (!reward) {
    throw ApiError.notFound('Reward not found');
  }
  return reward;
};

export const update = async (id, updateData) => {
  delete updateData.earnedBy;

  const reward = await Reward.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!reward) {
    throw ApiError.notFound('Reward not found');
  }
  return reward;
};

export const remove = async (id) => {
  const reward = await Reward.findById(id);
  if (!reward) {
    throw ApiError.notFound('Reward not found');
  }

  reward.isActive = false;
  await reward.save();
};

const getUserStats = async (userId) => {
  const [routeCount, reportCount, reviewCount, rideCount, user] = await Promise.all([
    Route.countDocuments({ createdBy: userId, isActive: true }),
    Report.countDocuments({ reportedBy: userId }),
    Review.countDocuments({ reviewer: userId }),
    Ride.countDocuments({ user: userId, status: 'completed', isActive: true }),
    User.findById(userId),
  ]);

  return {
    totalDistance: user?.totalDistance || 0,
    routesCreated: routeCount,
    reportsSubmitted: reportCount,
    reviewsWritten: reviewCount,
    ridesCompleted: rideCount,
  };
};

export const checkAndGrantRewards = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  const stats = await getUserStats(userId);
  const activeRewards = await Reward.find({ isActive: true });
  const granted = [];

  for (const reward of activeRewards) {
    if (user.achievements.includes(reward._id)) {
      continue;
    }

    let qualifies = false;
    const { type, threshold } = reward.criteria;

    switch (type) {
      case 'totalDistance':
        qualifies = stats.totalDistance >= threshold;
        break;
      case 'routesCreated':
        qualifies = stats.routesCreated >= threshold;
        break;
      case 'reportsSubmitted':
        qualifies = stats.reportsSubmitted >= threshold;
        break;
      case 'reviewsWritten':
        qualifies = stats.reviewsWritten >= threshold;
        break;
      case 'ridesCompleted':
        qualifies = stats.ridesCompleted >= threshold;
        break;
      default:
        break;
    }

    if (qualifies) {
      user.achievements.push(reward._id);
      user.totalPoints += reward.pointsAwarded;
      reward.earnedBy.push(userId);
      await reward.save();
      granted.push(reward);
    }
  }

  if (granted.length > 0) {
    await user.save();
  }

  return { granted, totalAchievements: user.achievements.length };
};
