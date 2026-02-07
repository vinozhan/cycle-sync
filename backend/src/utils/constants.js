export const ROLES = {
  CYCLIST: 'cyclist',
  ADMIN: 'admin',
};

export const DIFFICULTY = ['easy', 'moderate', 'hard', 'expert'];

export const SURFACE_TYPES = ['paved', 'gravel', 'mixed', 'trail'];

export const REPORT_CATEGORIES = [
  'pothole',
  'construction',
  'poor_lighting',
  'traffic_hazard',
  'flooding',
  'obstruction',
  'dangerous_intersection',
  'other',
];

export const REPORT_SEVERITY = ['low', 'medium', 'high', 'critical'];

export const REPORT_STATUS = ['open', 'under_review', 'resolved', 'dismissed'];

export const REWARD_CATEGORIES = ['distance', 'routes', 'reports', 'reviews', 'streak', 'special'];

export const REWARD_TIERS = ['bronze', 'silver', 'gold', 'platinum'];

export const POINTS = {
  REPORT_SUBMITTED: 5,
  REVIEW_WRITTEN: 10,
};

export const JWT = {
  ACCESS_EXPIRY: '15m',
  REFRESH_EXPIRY: '7d',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};
