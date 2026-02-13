/**
 * Calculate updated streak values based on the current ride completion.
 * Uses UTC midnight normalization for day comparison.
 *
 * @param {Date|null} lastRideDate - User's last ride date
 * @param {number} currentStreak - User's current streak
 * @param {number} longestStreak - User's longest streak
 * @returns {{ currentStreak: number, longestStreak: number, lastRideDate: Date }}
 */
export const calculateStreak = (lastRideDate, currentStreak, longestStreak) => {
  const now = new Date();
  const todayUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  if (!lastRideDate) {
    return { currentStreak: 1, longestStreak: Math.max(longestStreak, 1), lastRideDate: now };
  }

  const last = new Date(lastRideDate);
  const lastUTC = Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate());
  const diffDays = Math.round((todayUTC - lastUTC) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return { currentStreak, longestStreak, lastRideDate: last };
  }

  if (diffDays === 1) {
    const newStreak = currentStreak + 1;
    return {
      currentStreak: newStreak,
      longestStreak: Math.max(longestStreak, newStreak),
      lastRideDate: now,
    };
  }

  // Gap > 1 day — reset streak
  return { currentStreak: 1, longestStreak: Math.max(longestStreak, 1), lastRideDate: now };
};
