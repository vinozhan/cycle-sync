import { body, param, query } from 'express-validator';
import { REPORT_CATEGORIES, REPORT_SEVERITY, REPORT_STATUS, CONFIRMATION_TYPES } from '../utils/constants.js';

export const createReportValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Report title is required')
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters')
    .escape(),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters')
    .escape(),

  body('route')
    .optional()
    .isMongoId()
    .withMessage('Invalid route ID'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(REPORT_CATEGORIES)
    .withMessage(`Category must be one of: ${REPORT_CATEGORIES.join(', ')}`),

  body('severity')
    .notEmpty()
    .withMessage('Severity is required')
    .isIn(REPORT_SEVERITY)
    .withMessage(`Severity must be one of: ${REPORT_SEVERITY.join(', ')}`),

  body('location.lat')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('location.lng')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('location.address')
    .optional()
    .trim()
    .isString()
    .escape(),

  body('imageUrl')
    .optional()
    .isString()
    .withMessage('Image URL must be a string'),
];

export const updateReportValidator = [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 150 })
    .withMessage('Title cannot exceed 150 characters')
    .escape(),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters')
    .escape(),

  body('category')
    .optional()
    .isIn(REPORT_CATEGORIES)
    .withMessage(`Category must be one of: ${REPORT_CATEGORIES.join(', ')}`),

  body('severity')
    .optional()
    .isIn(REPORT_SEVERITY)
    .withMessage(`Severity must be one of: ${REPORT_SEVERITY.join(', ')}`),

  body('imageUrl')
    .optional()
    .isString(),
];

export const updateStatusValidator = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(REPORT_STATUS)
    .withMessage(`Status must be one of: ${REPORT_STATUS.join(', ')}`),

  body('adminNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Admin notes cannot exceed 1000 characters')
    .escape(),
];

export const mongoIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid report ID'),
];

export const confirmReportValidator = [
  body('status')
    .notEmpty()
    .withMessage('Confirmation status is required')
    .isIn(CONFIRMATION_TYPES)
    .withMessage(`Status must be one of: ${CONFIRMATION_TYPES.join(', ')}`),
];

export const listReportsQuery = [
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
    .isIn(REPORT_CATEGORIES)
    .withMessage(`Category must be one of: ${REPORT_CATEGORIES.join(', ')}`),

  query('severity')
    .optional()
    .isIn(REPORT_SEVERITY)
    .withMessage(`Severity must be one of: ${REPORT_SEVERITY.join(', ')}`),

  query('status')
    .optional()
    .isIn(REPORT_STATUS)
    .withMessage(`Status must be one of: ${REPORT_STATUS.join(', ')}`),
];
