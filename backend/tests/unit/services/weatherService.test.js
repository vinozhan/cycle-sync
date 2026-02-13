import { calculateCyclingSuitability } from '../../../src/services/weatherService.js';

describe('calculateCyclingSuitability', () => {
  const baseWeather = {
    main: { temp: 20 },
    wind: { speed: 5 },
    rain: null,
    visibility: 10000,
  };

  it('should return excellent score for ideal conditions', () => {
    const result = calculateCyclingSuitability(baseWeather);
    expect(result.score).toBe(5);
    expect(result.label).toBe('Excellent');
    expect(result.advisories).toContain('Great day for cycling!');
  });

  it('should reduce score for freezing temperatures', () => {
    const weather = { ...baseWeather, main: { temp: -5 } };
    const result = calculateCyclingSuitability(weather);
    expect(result.score).toBeLessThanOrEqual(2);
    expect(result.advisories).toEqual(
      expect.arrayContaining([expect.stringContaining('Freezing')])
    );
  });

  it('should reduce score for very cold temperatures', () => {
    const weather = { ...baseWeather, main: { temp: 3 } };
    const result = calculateCyclingSuitability(weather);
    expect(result.score).toBeLessThanOrEqual(3);
    expect(result.advisories).toEqual(
      expect.arrayContaining([expect.stringContaining('Very cold')])
    );
  });

  it('should reduce score for cool temperatures', () => {
    const weather = { ...baseWeather, main: { temp: 8 } };
    const result = calculateCyclingSuitability(weather);
    expect(result.score).toBe(4);
    expect(result.advisories).toEqual(
      expect.arrayContaining([expect.stringContaining('Cool')])
    );
  });

  it('should reduce score for extreme heat', () => {
    const weather = { ...baseWeather, main: { temp: 38 } };
    const result = calculateCyclingSuitability(weather);
    expect(result.score).toBeLessThanOrEqual(3);
    expect(result.advisories).toEqual(
      expect.arrayContaining([expect.stringContaining('Extreme heat')])
    );
  });

  it('should reduce score for hot conditions', () => {
    const weather = { ...baseWeather, main: { temp: 32 } };
    const result = calculateCyclingSuitability(weather);
    expect(result.score).toBe(4);
    expect(result.advisories).toEqual(
      expect.arrayContaining([expect.stringContaining('Hot')])
    );
  });

  it('should reduce score for dangerous winds', () => {
    // 51 km/h = 51/3.6 = ~14.17 m/s
    const weather = { ...baseWeather, wind: { speed: 14.2 } };
    const result = calculateCyclingSuitability(weather);
    expect(result.score).toBeLessThanOrEqual(2);
    expect(result.advisories).toEqual(
      expect.arrayContaining([expect.stringContaining('Dangerously high winds')])
    );
  });

  it('should reduce score for strong winds', () => {
    // 35 km/h = ~9.7 m/s
    const weather = { ...baseWeather, wind: { speed: 9.8 } };
    const result = calculateCyclingSuitability(weather);
    expect(result.score).toBeLessThanOrEqual(3);
    expect(result.advisories).toEqual(
      expect.arrayContaining([expect.stringContaining('Strong winds')])
    );
  });

  it('should reduce score for moderate winds', () => {
    // 25 km/h = ~6.9 m/s
    const weather = { ...baseWeather, wind: { speed: 6.5 } };
    const result = calculateCyclingSuitability(weather);
    expect(result.score).toBe(4);
  });

  it('should reduce score for rain', () => {
    const weather = { ...baseWeather, rain: { '1h': 2 } };
    const result = calculateCyclingSuitability(weather);
    expect(result.score).toBeLessThanOrEqual(3);
    expect(result.advisories).toEqual(
      expect.arrayContaining([expect.stringContaining('Rain')])
    );
  });

  it('should reduce score for low visibility', () => {
    const weather = { ...baseWeather, visibility: 500 };
    const result = calculateCyclingSuitability(weather);
    expect(result.score).toBeLessThanOrEqual(3);
    expect(result.advisories).toEqual(
      expect.arrayContaining([expect.stringContaining('Low visibility')])
    );
  });

  it('should reduce score for reduced visibility', () => {
    const weather = { ...baseWeather, visibility: 2000 };
    const result = calculateCyclingSuitability(weather);
    expect(result.score).toBe(4);
    expect(result.advisories).toEqual(
      expect.arrayContaining([expect.stringContaining('Reduced visibility')])
    );
  });

  it('should clamp score to minimum of 1', () => {
    const weather = {
      main: { temp: -10 },
      wind: { speed: 20 },
      rain: { '1h': 5 },
      visibility: 200,
    };
    const result = calculateCyclingSuitability(weather);
    expect(result.score).toBe(1);
    expect(result.label).toBe('Not Recommended');
  });

  it('should combine multiple adverse conditions', () => {
    const weather = {
      main: { temp: 3 },
      wind: { speed: 9.8 },
      rain: null,
      visibility: 10000,
    };
    const result = calculateCyclingSuitability(weather);
    expect(result.score).toBe(1);
    expect(result.advisories.length).toBeGreaterThan(1);
  });
});
