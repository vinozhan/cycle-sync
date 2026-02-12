import { body, param, query } from 'express-validator';

export const createReviewValidator = [
  body('route')
    .notEmpty()
    .withMessage('Route ID is required')
    .isMongoId()
    .withMessage('Invalid route ID'),

  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters')
    .escape(),

  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ max: 1500 })
    .withMessage('Comment cannot exceed 1500 characters')
    .escape(),

  body('safetyScore')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Safety score must be between 1 and 5'),

  body('sceneryScore')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Scenery score must be between 1 and 5'),

  body('difficultyAccuracy')
    .optional()
    .isIn(['easier', 'accurate', 'harder'])
    .withMessage('Difficulty accuracy must be easier, accurate, or harder'),
];

export const updateReviewValidator = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters')
    .escape(),

  body('comment')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Comment cannot be empty')
    .isLength({ max: 1500 })
    .withMessage('Comment cannot exceed 1500 characters')
    .escape(),

  body('safetyScore')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Safety score must be between 1 and 5'),

  body('sceneryScore')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Scenery score must be between 1 and 5'),

  body('difficultyAccuracy')
    .optional()
    .isIn(['easier', 'accurate', 'harder'])
    .withMessage('Difficulty accuracy must be easier, accurate, or harder'),
];

export const mongoIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid review ID'),
];

export const listReviewsQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('route')
    .optional()
    .isMongoId()
    .withMessage('Invalid route ID'),

  query('minRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Minimum rating must be between 1 and 5'),

  query('maxRating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Maximum rating must be between 1 and 5'),
];
