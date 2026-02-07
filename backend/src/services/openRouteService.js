import axios from 'axios';
import env from '../config/env.js';

class OpenRouteServiceClient {
  constructor() {
    this.apiKey = env.orsApiKey;
    this.baseUrl = 'https://api.openrouteservice.org/v2';
  }

  async getDirections(coordinates, profile = 'cycling-regular') {
    if (!this.apiKey) {
      return null;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/directions/${profile}/json`,
        { coordinates, elevation: true },
        {
          headers: {
            Authorization: this.apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      const route = response.data.routes[0];
      return {
        distance: parseFloat((route.summary.distance / 1000).toFixed(2)),
        duration: parseFloat((route.summary.duration / 60).toFixed(1)),
        elevationGain: route.summary.ascent ? Math.round(route.summary.ascent) : 0,
        polyline: route.geometry || '',
      };
    } catch (error) {
      console.error('OpenRouteService API error:', error.response?.data || error.message);
      return null;
    }
  }
}

export default new OpenRouteServiceClient();
