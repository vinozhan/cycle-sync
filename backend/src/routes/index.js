const express = require('express');

const router = express.Router();

router.use('/auth', require('./authRoutes'));
// router.use('/users', require('./userRoutes'));
// router.use('/routes', require('./routeRoutes'));
// router.use('/reports', require('./reportRoutes'));
// router.use('/reviews', require('./reviewRoutes'));
// router.use('/rewards', require('./rewardRoutes'));
// router.use('/weather', require('./weatherRoutes'));

module.exports = router;
