import { Router } from 'express';
import * as routeController from '../controllers/routeController.js';
import {
  createRouteValidator,
  updateRouteValidator,
  mongoIdParam,
  listRoutesQuery,
} from '../validators/routeValidator.js';
import validate from '../middleware/validate.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Routes
 *   description: Cycling route management
 */

/**
 * @swagger
 * /routes:
 *   get:
 *     summary: List cycling routes (public, paginated, filterable)
 *     tags: [Routes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, moderate, hard, expert]
 *       - in: query
 *         name: surfaceType
 *         schema:
 *           type: string
 *           enum: [paved, gravel, mixed, trail]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: minDistance
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: number
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Paginated list of routes
 */
router.get('/', listRoutesQuery, validate, routeController.list);

/**
 * @swagger
 * /routes/nearby:
 *   get:
 *     summary: Find routes near given coordinates
 *     tags: [Routes]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: number
 *         description: Max distance in km (default 10)
 *     responses:
 *       200:
 *         description: Nearby routes
 */
router.get('/nearby', routeController.getNearby);

/**
 * @swagger
 * /routes/{id}:
 *   get:
 *     summary: Get a single route by ID
 *     tags: [Routes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Route details
 *       404:
 *         description: Route not found
 */
router.get('/:id', mongoIdParam, validate, routeController.getById);

/**
 * @swagger
 * /routes:
 *   post:
 *     summary: Create a new cycling route (authenticated cyclists)
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - startPoint
 *               - endPoint
 *               - distance
 *               - difficulty
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startPoint:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               endPoint:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               distance:
 *                 type: number
 *               difficulty:
 *                 type: string
 *                 enum: [easy, moderate, hard, expert]
 *     responses:
 *       201:
 *         description: Route created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, createRouteValidator, validate, routeController.create);

/**
 * @swagger
 * /routes/{id}:
 *   put:
 *     summary: Update a route (owner or admin)
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Route updated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Route not found
 */
router.put(
  '/:id',
  auth,
  mongoIdParam,
  updateRouteValidator,
  validate,
  routeController.update
);

/**
 * @swagger
 * /routes/{id}:
 *   delete:
 *     summary: Delete a route (owner or admin, soft delete)
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Route deleted
 *       403:
 *         description: Not authorized
 */
router.delete('/:id', auth, mongoIdParam, validate, routeController.remove);

/**
 * @swagger
 * /routes/{id}/verify:
 *   patch:
 *     summary: Verify a route (admin only)
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Route verified
 *       403:
 *         description: Admin access required
 */
router.patch(
  '/:id/verify',
  auth,
  authorize(ROLES.ADMIN),
  mongoIdParam,
  validate,
  routeController.verify
);

/**
 * @swagger
 * /routes/{id}/weather:
 *   get:
 *     summary: Get weather at route start point
 *     tags: [Routes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Weather data with cycling suitability
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/:id/weather',
  auth,
  mongoIdParam,
  validate,
  routeController.getWeather
);

export default router;
