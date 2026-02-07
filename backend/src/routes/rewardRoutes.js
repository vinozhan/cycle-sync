import { Router } from 'express';
import * as rewardController from '../controllers/rewardController.js';
import {
  createRewardValidator,
  updateRewardValidator,
  mongoIdParam,
  userIdParam,
  listRewardsQuery,
} from '../validators/rewardValidator.js';
import validate from '../middleware/validate.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Rewards
 *   description: Gamification rewards and achievements
 */

/**
 * @swagger
 * /rewards:
 *   get:
 *     summary: List all rewards (authenticated)
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
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
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: tier
 *         schema:
 *           type: string
 *           enum: [bronze, silver, gold, platinum]
 *     responses:
 *       200:
 *         description: Paginated list of rewards
 */
router.get('/', auth, listRewardsQuery, validate, rewardController.list);

/**
 * @swagger
 * /rewards/{id}:
 *   get:
 *     summary: Get a single reward by ID
 *     tags: [Rewards]
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
 *         description: Reward details
 *       404:
 *         description: Reward not found
 */
router.get('/:id', auth, mongoIdParam, validate, rewardController.getById);

/**
 * @swagger
 * /rewards:
 *   post:
 *     summary: Create a new reward (admin only)
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - icon
 *               - category
 *               - criteria
 *               - pointsAwarded
 *               - tier
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               category:
 *                 type: string
 *               criteria:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                   threshold:
 *                     type: integer
 *               pointsAwarded:
 *                 type: integer
 *               tier:
 *                 type: string
 *                 enum: [bronze, silver, gold, platinum]
 *     responses:
 *       201:
 *         description: Reward created
 *       403:
 *         description: Admin access required
 */
router.post(
  '/',
  auth,
  authorize(ROLES.ADMIN),
  createRewardValidator,
  validate,
  rewardController.create
);

/**
 * @swagger
 * /rewards/{id}:
 *   put:
 *     summary: Update a reward (admin only)
 *     tags: [Rewards]
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
 *         description: Reward updated
 *       403:
 *         description: Admin access required
 */
router.put(
  '/:id',
  auth,
  authorize(ROLES.ADMIN),
  mongoIdParam,
  updateRewardValidator,
  validate,
  rewardController.update
);

/**
 * @swagger
 * /rewards/{id}:
 *   delete:
 *     summary: Delete a reward (admin only, soft delete)
 *     tags: [Rewards]
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
 *         description: Reward deleted
 *       403:
 *         description: Admin access required
 */
router.delete(
  '/:id',
  auth,
  authorize(ROLES.ADMIN),
  mongoIdParam,
  validate,
  rewardController.remove
);

/**
 * @swagger
 * /rewards/check/{userId}:
 *   post:
 *     summary: Evaluate and grant eligible rewards to a user (admin)
 *     tags: [Rewards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Rewards evaluation result
 *       403:
 *         description: Admin access required
 */
router.post(
  '/check/:userId',
  auth,
  authorize(ROLES.ADMIN),
  userIdParam,
  validate,
  rewardController.checkRewards
);

export default router;
