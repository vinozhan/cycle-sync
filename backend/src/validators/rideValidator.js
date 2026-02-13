import { body, param, query } from 'express-validator';
import { RIDE_STATUS } from '../utils/constants.js';

export const startRideValidator = [
  body('route')
    .notEmpty()
    .withMessage('Route ID is required')
    .isMongoId()
    .withMessage('Invalid route ID'),
];

export const mongoIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ride ID'),
];

export const listRidesQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(RIDE_STATUS)
    .withMessage(`Status must be one of: ${RIDE_STATUS.join(', ')}`),
];
