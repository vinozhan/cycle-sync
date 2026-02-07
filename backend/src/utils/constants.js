module.exports = {
  ROLES: {
    CYCLIST: 'cyclist',
    ADMIN: 'admin',
  },

  DIFFICULTY: ['easy', 'moderate', 'hard', 'expert'],

  SURFACE_TYPES: ['paved', 'gravel', 'mixed', 'trail'],

  REPORT_CATEGORIES: [
    'pothole',
    'construction',
    'poor_lighting',
    'traffic_hazard',
    'flooding',
    'obstruction',
    'dangerous_intersection',
    'other',
  ],

  REPORT_SEVERITY: ['low', 'medium', 'high', 'critical'],

  REPORT_STATUS: ['open', 'under_review', 'resolved', 'dismissed'],

  REWARD_CATEGORIES: ['distance', 'routes', 'reports', 'reviews', 'streak', 'special'],

  REWARD_TIERS: ['bronze', 'silver', 'gold', 'platinum'],

  POINTS: {
    REPORT_SUBMITTED: 5,
    REVIEW_WRITTEN: 10,
  },

  JWT: {
    ACCESS_EXPIRY: '15m',
    REFRESH_EXPIRY: '7d',
  },

  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },
};
