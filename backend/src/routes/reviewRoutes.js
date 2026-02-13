import { Router } from 'express';
import * as reviewController from '../controllers/reviewController.js';
import {
  createReviewValidator,
  updateReviewValidator,
  mongoIdParam,
  listReviewsQuery,
} from '../validators/reviewValidator.js';
import validate from '../middleware/validate.js';
import auth from '../middleware/auth.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Route review and rating management
 */

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: List reviews (public, paginated, filterable)
 *     tags: [Reviews]
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
 *         name: route
 *         schema:
 *           type: string
 *         description: Filter by route ID
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated list of reviews
 */
router.get('/', listReviewsQuery, validate, reviewController.list);

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: Get a single review by ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review details
 *       404:
 *         description: Review not found
 */
router.get('/:id', mongoIdParam, validate, reviewController.getById);

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a route review (authenticated, one per route)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - route
 *               - rating
 *               - title
 *               - comment
 *             properties:
 *               route:
 *                 type: string
 *                 description: Route ID to review
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               title:
 *                 type: string
 *               comment:
 *                 type: string
 *               safetyScore:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               sceneryScore:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               difficultyAccuracy:
 *                 type: string
 *                 enum: [easier, accurate, harder]
 *     responses:
 *       201:
 *         description: Review created
 *       400:
 *         description: Validation error
 *       409:
 *         description: Already reviewed this route
 */
router.post('/', auth, createReviewValidator, validate, reviewController.create);

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Update own review
 *     tags: [Reviews]
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
 *         description: Review updated
 *       403:
 *         description: Not authorized
 */
router.put(
  '/:id',
  auth,
  mongoIdParam,
  updateReviewValidator,
  validate,
  reviewController.update
);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review (owner or admin)
 *     tags: [Reviews]
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
 *         description: Review deleted
 *       403:
 *         description: Not authorized
 */
router.delete('/:id', auth, mongoIdParam, validate, reviewController.remove);

export default router;
