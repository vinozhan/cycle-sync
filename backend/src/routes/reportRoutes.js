import { Router } from 'express';
import * as reportController from '../controllers/reportController.js';
import {
  createReportValidator,
  updateReportValidator,
  updateStatusValidator,
  mongoIdParam,
  listReportsQuery,
} from '../validators/reportValidator.js';
import validate from '../middleware/validate.js';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Safety and hazard report management
 */

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: List hazard reports (authenticated, filterable)
 *     tags: [Reports]
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
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, under_review, resolved, dismissed]
 *     responses:
 *       200:
 *         description: Paginated list of reports
 */
router.get('/', auth, listReportsQuery, validate, reportController.list);

/**
 * @swagger
 * /reports/{id}:
 *   get:
 *     summary: Get a single report by ID
 *     tags: [Reports]
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
 *         description: Report details
 *       404:
 *         description: Report not found
 */
router.get('/:id', auth, mongoIdParam, validate, reportController.getById);

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Create a hazard report (authenticated cyclists)
 *     tags: [Reports]
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
 *               - category
 *               - severity
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               route:
 *                 type: string
 *                 description: Optional route ID
 *               category:
 *                 type: string
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               location:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *                   address:
 *                     type: string
 *     responses:
 *       201:
 *         description: Report created
 *       400:
 *         description: Validation error
 */
router.post('/', auth, createReportValidator, validate, reportController.create);

/**
 * @swagger
 * /reports/{id}:
 *   put:
 *     summary: Update own report (only if status is open)
 *     tags: [Reports]
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
 *         description: Report updated
 *       400:
 *         description: Can only edit open reports
 *       403:
 *         description: Not authorized
 */
router.put(
  '/:id',
  auth,
  mongoIdParam,
  updateReportValidator,
  validate,
  reportController.update
);

/**
 * @swagger
 * /reports/{id}:
 *   delete:
 *     summary: Delete a report (owner or admin)
 *     tags: [Reports]
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
 *         description: Report deleted
 *       403:
 *         description: Not authorized
 */
router.delete('/:id', auth, mongoIdParam, validate, reportController.remove);

/**
 * @swagger
 * /reports/{id}/status:
 *   patch:
 *     summary: Update report status (admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, under_review, resolved, dismissed]
 *               adminNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated
 *       403:
 *         description: Admin access required
 */
router.patch(
  '/:id/status',
  auth,
  authorize(ROLES.ADMIN),
  mongoIdParam,
  updateStatusValidator,
  validate,
  reportController.updateStatus
);

export default router;
