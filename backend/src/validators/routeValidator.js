import { body, param, query } from 'express-validator';
import { DIFFICULTY, SURFACE_TYPES } from '../utils/constants.js';

export const createRouteValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Route title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters')
    .escape(),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Route description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters')
    .escape(),

  body('startPoint.lat')
    .notEmpty()
    .withMessage('Start point latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('startPoint.lng')
    .notEmpty()
    .withMessage('Start point longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('startPoint.name')
    .optional()
    .trim()
    .isString()
    .escape(),

  body('endPoint.lat')
    .notEmpty()
    .withMessage('End point latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('endPoint.lng')
    .notEmpty()
    .withMessage('End point longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('endPoint.name')
    .optional()
    .trim()
    .isString()
    .escape(),

  body('waypoints')
    .optional()
    .isArray()
    .withMessage('Waypoints must be an array'),

  body('waypoints.*.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Waypoint latitude must be between -90 and 90'),

  body('waypoints.*.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Waypoint longitude must be between -180 and 180'),

  body('distance')
    .notEmpty()
    .withMessage('Distance is required')
    .isFloat({ min: 0 })
    .withMessage('Distance must be a positive number'),

  body('estimatedDuration')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Duration must be a positive number'),

  body('difficulty')
    .notEmpty()
    .withMessage('Difficulty is required')
    .isIn(DIFFICULTY)
    .withMessage(`Difficulty must be one of: ${DIFFICULTY.join(', ')}`),

  body('surfaceType')
    .optional()
    .isIn(SURFACE_TYPES)
    .withMessage(`Surface type must be one of: ${SURFACE_TYPES.join(', ')}`),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .trim()
    .isString()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters')
    .escape(),

  body('city')
    .optional()
    .trim()
    .isString()
    .escape(),

  body('country')
    .optional()
    .trim()
    .isString()
    .escape(),
];

export const updateRouteValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters')
    .escape(),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters')
    .escape(),

  body('difficulty')
    .optional()
    .isIn(DIFFICULTY)
    .withMessage(`Difficulty must be one of: ${DIFFICULTY.join(', ')}`),

  body('surfaceType')
    .optional()
    .isIn(SURFACE_TYPES)
    .withMessage(`Surface type must be one of: ${SURFACE_TYPES.join(', ')}`),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('city')
    .optional()
    .trim()
    .isString()
    .escape(),

  body('country')
    .optional()
    .trim()
    .isString()
    .escape(),
];

export const previewRouteValidator = [
  body('start.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Start latitude must be between -90 and 90'),

  body('start.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Start longitude must be between -180 and 180'),

  body('end.lat')
    .isFloat({ min: -90, max: 90 })
    .withMessage('End latitude must be between -90 and 90'),

  body('end.lng')
    .isFloat({ min: -180, max: 180 })
    .withMessage('End longitude must be between -180 and 180'),
];

export const mongoIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid route ID'),
];

export const listRoutesQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('difficulty')
    .optional()
    .isIn(DIFFICULTY)
    .withMessage(`Difficulty must be one of: ${DIFFICULTY.join(', ')}`),

  query('surfaceType')
    .optional()
    .isIn(SURFACE_TYPES)
    .withMessage(`Surface type must be one of: ${SURFACE_TYPES.join(', ')}`),

  query('minDistance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum distance must be positive'),

  query('maxDistance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum distance must be positive'),

  query('minRating')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Minimum rating must be between 1 and 5'),
];
