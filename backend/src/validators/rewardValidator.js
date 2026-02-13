import { body, param, query } from 'express-validator';
import { REWARD_CATEGORIES, REWARD_TIERS } from '../utils/constants.js';

export const createRewardValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Reward name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters')
    .escape(),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .escape(),

  body('icon')
    .trim()
    .notEmpty()
    .withMessage('Icon is required'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(REWARD_CATEGORIES)
    .withMessage(`Category must be one of: ${REWARD_CATEGORIES.join(', ')}`),

  body('criteria.type')
    .notEmpty()
    .withMessage('Criteria type is required')
    .isIn(['totalDistance', 'routesCreated', 'reportsSubmitted', 'reviewsWritten', 'ridesCompleted'])
    .withMessage('Criteria type must be one of: totalDistance, routesCreated, reportsSubmitted, reviewsWritten, ridesCompleted'),

  body('criteria.threshold')
    .notEmpty()
    .withMessage('Criteria threshold is required')
    .isInt({ min: 1 })
    .withMessage('Threshold must be at least 1'),

  body('pointsAwarded')
    .notEmpty()
    .withMessage('Points awarded is required')
    .isInt({ min: 0 })
    .withMessage('Points must be non-negative'),

  body('tier')
    .notEmpty()
    .withMessage('Tier is required')
    .isIn(REWARD_TIERS)
    .withMessage(`Tier must be one of: ${REWARD_TIERS.join(', ')}`),
];

export const updateRewardValidator = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters')
    .escape(),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .escape(),

  body('icon')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Icon cannot be empty'),

  body('category')
    .optional()
    .isIn(REWARD_CATEGORIES)
    .withMessage(`Category must be one of: ${REWARD_CATEGORIES.join(', ')}`),

  body('pointsAwarded')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Points must be non-negative'),

  body('tier')
    .optional()
    .isIn(REWARD_TIERS)
    .withMessage(`Tier must be one of: ${REWARD_TIERS.join(', ')}`),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

export const mongoIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid reward ID'),
];

export const userIdParam = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
];

export const listRewardsQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('category')
    .optional()
    .isIn(REWARD_CATEGORIES)
    .withMessage(`Category must be one of: ${REWARD_CATEGORIES.join(', ')}`),

  query('tier')
    .optional()
    .isIn(REWARD_TIERS)
    .withMessage(`Tier must be one of: ${REWARD_TIERS.join(', ')}`),
];
