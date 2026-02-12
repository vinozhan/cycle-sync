import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import routeRoutes from './routeRoutes.js';
import reportRoutes from './reportRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import rewardRoutes from './rewardRoutes.js';
import weatherRoutes from './weatherRoutes.js';
import rideRoutes from './rideRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/routes', routeRoutes);
router.use('/reports', reportRoutes);
router.use('/reviews', reviewRoutes);
router.use('/rewards', rewardRoutes);
router.use('/weather', weatherRoutes);
router.use('/rides', rideRoutes);

export default router;
