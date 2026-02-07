import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import {
  updateUserValidator,
  changePasswordValidator,
  mongoIdParam,
  listUsersQuery,
} from '../validators/userValidator.js';
import validate from '../middleware/validate.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [cyclist, admin]
 *         description: Filter by role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get(
  '/',
  auth,
  authorize(ROLES.ADMIN),
  listUsersQuery,
  validate,
  userController.listUsers
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
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
 *         description: User profile
 *       404:
 *         description: User not found
 */
router.get('/:id', auth, mongoIdParam, validate, userController.getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user profile (owner or admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               bio:
 *                 type: string
 *               preferredDifficulty:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *     responses:
 *       200:
 *         description: Profile updated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
router.put(
  '/:id',
  auth,
  mongoIdParam,
  updateUserValidator,
  validate,
  userController.updateUser
);

/**
 * @swagger
 * /users/change-password:
 *   patch:
 *     summary: Change own password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed
 *       400:
 *         description: Current password incorrect
 */
router.patch(
  '/change-password',
  auth,
  changePasswordValidator,
  validate,
  userController.changePassword
);

/**
 * @swagger
 * /users/{id}/deactivate:
 *   delete:
 *     summary: Deactivate a user account (admin only)
 *     tags: [Users]
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
 *         description: User deactivated
 *       403:
 *         description: Admin access required
 */
router.delete(
  '/:id',
  auth,
  authorize(ROLES.ADMIN),
  mongoIdParam,
  validate,
  userController.deactivateUser
);

/**
 * @swagger
 * /users/{id}/reactivate:
 *   patch:
 *     summary: Reactivate a deactivated user (admin only)
 *     tags: [Users]
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
 *         description: User reactivated
 *       403:
 *         description: Admin access required
 */
router.patch(
  '/:id/reactivate',
  auth,
  authorize(ROLES.ADMIN),
  mongoIdParam,
  validate,
  userController.reactivateUser
);

/**
 * @swagger
 * /users/{id}/achievements:
 *   get:
 *     summary: Get user's earned rewards
 *     tags: [Users]
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
 *         description: User achievements
 */
router.get(
  '/:id/achievements',
  auth,
  mongoIdParam,
  validate,
  userController.getUserAchievements
);

/**
 * @swagger
 * /users/{id}/stats:
 *   get:
 *     summary: Get user's cycling statistics
 *     tags: [Users]
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
 *         description: User statistics
 */
router.get(
  '/:id/stats',
  auth,
  mongoIdParam,
  validate,
  userController.getUserStats
);

export default router;
