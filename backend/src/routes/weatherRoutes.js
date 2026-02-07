import { Router } from 'express';
import { query } from 'express-validator';
import { getCyclingWeather } from '../services/weatherService.js';
import validate from '../middleware/validate.js';
import auth from '../middleware/auth.js';
import ApiResponse from '../utils/ApiResponse.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Weather
 *   description: Weather and cycling advisory
 */

const weatherQueryValidator = [
  query('lat')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  query('lng')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
];

/**
 * @swagger
 * /weather:
 *   get:
 *     summary: Get weather and cycling advisory for coordinates
 *     tags: [Weather]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         description: Latitude
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         description: Longitude
 *     responses:
 *       200:
 *         description: Weather data with cycling suitability score
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, weatherQueryValidator, validate, async (req, res, next) => {
  try {
    const weather = await getCyclingWeather(
      parseFloat(req.query.lat),
      parseFloat(req.query.lng)
    );
    ApiResponse.success(res, { weather });
  } catch (error) {
    next(error);
  }
});

export default router;
