import Review from '../models/Review.js';
import Route from '../models/Route.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { buildPagination, paginateResult } from '../utils/pagination.js';
import { POINTS } from '../utils/constants.js';
import { checkAndGrantRewards } from './rewardService.js';

export const recalculateRouteRating = async (routeId) => {
  const result = await Review.aggregate([
    { $match: { route: routeId } },
    {
      $group: {
        _id: '$route',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Route.findByIdAndUpdate(routeId, {
      averageRating: parseFloat(result[0].averageRating.toFixed(1)),
      reviewCount: result[0].reviewCount,
    });
  } else {
    await Route.findByIdAndUpdate(routeId, {
      averageRating: 0,
      reviewCount: 0,
    });
  }
};

export const create = async (reviewData, userId) => {
  reviewData.reviewer = userId;

  const route = await Route.findById(reviewData.route);
  if (!route || !route.isActive) {
    throw ApiError.notFound('Route not found');
  }

  if (route.createdBy.toString() === userId) {
    throw ApiError.badRequest('You cannot review your own route');
  }

  let review;
  try {
    review = await Review.create(reviewData);
  } catch (error) {
    if (error.code === 11000) {
      throw ApiError.conflict('You have already reviewed this route');
    }
    throw error;
  }

  await recalculateRouteRating(route._id);

  await User.findByIdAndUpdate(userId, {
    $inc: { totalPoints: POINTS.REVIEW_WRITTEN },
  });

  try {
    await checkAndGrantRewards(userId);
  } catch {
    // Reward check failure should not block review creation
  }

  return review.populate([
    { path: 'reviewer', select: 'firstName lastName avatar' },
    { path: 'route', select: 'title' },
  ]);
};

export const list = async (queryParams) => {
  const { page, limit, skip, sort } = buildPagination(queryParams);
  const filter = {};

  if (queryParams.route) {
    filter.route = queryParams.route;
  }

  if (queryParams.reviewer) {
    filter.reviewer = queryParams.reviewer;
  }

  if (queryParams.minRating || queryParams.maxRating) {
    filter.rating = {};
    if (queryParams.minRating) filter.rating.$gte = parseInt(queryParams.minRating, 10);
    if (queryParams.maxRating) filter.rating.$lte = parseInt(queryParams.maxRating, 10);
  }

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .populate('reviewer', 'firstName lastName avatar')
      .populate('route', 'title')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Review.countDocuments(filter),
  ]);

  return paginateResult(reviews, total, page, limit);
};

export const getById = async (id) => {
  const review = await Review.findById(id)
    .populate('reviewer', 'firstName lastName avatar')
    .populate('route', 'title');

  if (!review) {
    throw ApiError.notFound('Review not found');
  }
  return review;
};

export const update = async (id, updateData, userId) => {
  const review = await Review.findById(id);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  if (review.reviewer.toString() !== userId) {
    throw ApiError.forbidden('You can only update your own reviews');
  }

  delete updateData.reviewer;
  delete updateData.route;
  delete updateData.isEdited;

  Object.assign(review, updateData);
  await review.save();

  if (updateData.rating !== undefined) {
    await recalculateRouteRating(review.route);
  }

  return review.populate([
    { path: 'reviewer', select: 'firstName lastName avatar' },
    { path: 'route', select: 'title' },
  ]);
};

export const remove = async (id, userId, userRole) => {
  const review = await Review.findById(id);
  if (!review) {
    throw ApiError.notFound('Review not found');
  }

  if (review.reviewer.toString() !== userId && userRole !== 'admin') {
    throw ApiError.forbidden('You can only delete your own reviews');
  }

  const routeId = review.route;
  await Review.findByIdAndDelete(id);

  await recalculateRouteRating(routeId);
};
