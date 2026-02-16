export const ROLES = {
  CYCLIST: 'cyclist',
  ADMIN: 'admin',
};

export const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy', color: 'text-green-600' },
  { value: 'moderate', label: 'Moderate', color: 'text-yellow-600' },
  { value: 'hard', label: 'Hard', color: 'text-orange-600' },
  { value: 'expert', label: 'Expert', color: 'text-red-600' },
];

export const SURFACE_OPTIONS = [
  { value: 'paved', label: 'Paved' },
  { value: 'gravel', label: 'Gravel' },
  { value: 'mixed', label: 'Mixed' },
  { value: 'trail', label: 'Trail' },
];

export const REPORT_CATEGORIES = [
  { value: 'pothole', label: 'Pothole' },
  { value: 'construction', label: 'Construction' },
  { value: 'poor_lighting', label: 'Poor Lighting' },
  { value: 'traffic_hazard', label: 'Traffic Hazard' },
  { value: 'flooding', label: 'Flooding' },
  { value: 'obstruction', label: 'Obstruction' },
  { value: 'dangerous_intersection', label: 'Dangerous Intersection' },
  { value: 'other', label: 'Other' },
];

export const SEVERITY_OPTIONS = [
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
];

export const REPORT_STATUS_OPTIONS = [
  { value: 'open', label: 'Open', color: 'bg-blue-100 text-blue-800' },
  { value: 'under_review', label: 'Under Review', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800' },
  { value: 'dismissed', label: 'Dismissed', color: 'bg-gray-100 text-gray-800' },
];

export const REWARD_TIERS = [
  { value: 'bronze', label: 'Bronze', color: 'text-amber-700' },
  { value: 'silver', label: 'Silver', color: 'text-gray-500' },
  { value: 'gold', label: 'Gold', color: 'text-yellow-500' },
  { value: 'platinum', label: 'Platinum', color: 'text-indigo-500' },
];

export const POINTS = {
  REPORT_SUBMITTED: 5,
  REPORT_CONFIRMED: 2,
  REVIEW_WRITTEN: 10,
  RIDE_COMPLETED: 10,
  ROUTE_CREATED: 15,
};

export const AUTO_RESOLVE_THRESHOLD = 3;

// Sri Lanka center (approx. Kandy area)
export const DEFAULT_MAP_CENTER = [7.8731, 80.7718];
export const DEFAULT_MAP_ZOOM = 8;
