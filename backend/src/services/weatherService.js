import axios from 'axios';
import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

export const calculateCyclingSuitability = (weather) => {
  let score = 5;
  const advisories = [];

  const temp = weather.main.temp;
  if (temp < 0) {
    score -= 3;
    advisories.push('Freezing conditions. Not safe for cycling.');
  } else if (temp < 5) {
    score -= 2;
    advisories.push('Very cold. Wear heavy layers.');
  } else if (temp < 10) {
    score -= 1;
    advisories.push('Cool. Dress warmly.');
  } else if (temp > 35) {
    score -= 2;
    advisories.push('Extreme heat. Risk of dehydration.');
  } else if (temp > 30) {
    score -= 1;
    advisories.push('Hot conditions. Stay hydrated.');
  }

  const windKmh = weather.wind.speed * 3.6;
  if (windKmh > 50) {
    score -= 3;
    advisories.push('Dangerously high winds.');
  } else if (windKmh > 30) {
    score -= 2;
    advisories.push('Strong winds. Difficult cycling.');
  } else if (windKmh > 20) {
    score -= 1;
    advisories.push('Moderate winds. Some resistance.');
  }

  if (weather.rain) {
    score -= 2;
    advisories.push('Rain expected. Roads may be slippery.');
  }

  if (weather.visibility < 1000) {
    score -= 2;
    advisories.push('Low visibility. Use lights.');
  } else if (weather.visibility < 3000) {
    score -= 1;
    advisories.push('Reduced visibility. Stay alert.');
  }

  score = Math.max(1, Math.min(5, score));

  const labels = {
    5: 'Excellent',
    4: 'Good',
    3: 'Fair',
    2: 'Poor',
    1: 'Not Recommended',
  };

  if (advisories.length === 0) {
    advisories.push('Great day for cycling!');
  }

  return { score, label: labels[score], advisories };
};

export const getCyclingWeather = async (lat, lng) => {
  if (!env.owmApiKey) {
    throw ApiError.internal('Weather service is not configured');
  }

  try {
    const response = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: {
          lat,
          lon: lng,
          appid: env.owmApiKey,
          units: 'metric',
        },
        timeout: 10000,
      }
    );

    const weather = response.data;
    const cycling = calculateCyclingSuitability(weather);

    return {
      location: weather.name,
      temperature: weather.main.temp,
      feelsLike: weather.main.feels_like,
      humidity: weather.main.humidity,
      windSpeed: parseFloat((weather.wind.speed * 3.6).toFixed(1)),
      windDirection: weather.wind.deg,
      description: weather.weather[0]?.description || '',
      icon: weather.weather[0]?.icon || '',
      visibility: weather.visibility,
      cycling,
    };
  } catch (error) {
    if (error.response?.status === 401) {
      throw ApiError.internal('Weather API key is invalid');
    }
    console.error('OpenWeatherMap API error:', error.response?.data || error.message);
    throw ApiError.internal('Failed to fetch weather data');
  }
};
