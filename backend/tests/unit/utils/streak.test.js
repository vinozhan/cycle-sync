import { calculateStreak } from '../../../src/utils/streak.js';

describe('calculateStreak', () => {
  it('should start a streak of 1 on first ride (null lastRideDate)', () => {
    const result = calculateStreak(null, 0, 0);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
    expect(result.lastRideDate).toBeInstanceOf(Date);
  });

  it('should not change streak for same-day ride', () => {
    const today = new Date();
    const result = calculateStreak(today, 3, 5);
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(5);
  });

  it('should increment streak for consecutive day ride', () => {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const result = calculateStreak(yesterday, 3, 5);
    expect(result.currentStreak).toBe(4);
    expect(result.longestStreak).toBe(5);
    expect(result.lastRideDate).toBeInstanceOf(Date);
  });

  it('should update longest streak when current exceeds it', () => {
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const result = calculateStreak(yesterday, 5, 5);
    expect(result.currentStreak).toBe(6);
    expect(result.longestStreak).toBe(6);
  });

  it('should reset streak to 1 when gap is more than 1 day', () => {
    const threeDaysAgo = new Date();
    threeDaysAgo.setUTCDate(threeDaysAgo.getUTCDate() - 3);
    const result = calculateStreak(threeDaysAgo, 7, 10);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(10);
    expect(result.lastRideDate).toBeInstanceOf(Date);
  });

  it('should preserve longest streak when resetting current', () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setUTCDate(twoDaysAgo.getUTCDate() - 2);
    const result = calculateStreak(twoDaysAgo, 3, 8);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(8);
  });

  it('should set longest to at least 1 on first ride even if longestStreak was 0', () => {
    const result = calculateStreak(null, 0, 0);
    expect(result.longestStreak).toBe(1);
  });

  it('should handle exactly 2 day gap as a reset', () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setUTCDate(twoDaysAgo.getUTCDate() - 2);
    const result = calculateStreak(twoDaysAgo, 5, 5);
    expect(result.currentStreak).toBe(1);
  });
});
