import { Router } from 'express';
import * as rideController from '../controllers/rideController.js';
import {
  startRideValidator,
  mongoIdParam,
  listRidesQuery,
} from '../validators/rideValidator.js';
import validate from '../middleware/validate.js';
import auth from '../middleware/auth.js';

const router = Router();

router.get('/stats', auth, rideController.getStats);
router.get('/active', auth, rideController.getActiveRide);
router.get('/', auth, listRidesQuery, validate, rideController.list);
router.get('/:id', auth, mongoIdParam, validate, rideController.getById);
router.post('/start', auth, startRideValidator, validate, rideController.start);
router.patch('/:id/complete', auth, mongoIdParam, validate, rideController.complete);
router.patch('/:id/cancel', auth, mongoIdParam, validate, rideController.cancel);

export default router;
