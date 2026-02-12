import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import { connectDB, disconnectDB, clearDB } from './setup.js';

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

afterEach(async () => {
  await clearDB();
});

const registerAndLogin = async (userData) => {
  const res = await request(app).post('/api/auth/register').send(userData);
  return { token: res.body.data.accessToken, user: res.body.data.user };
};

const cyclist = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  password: 'SecurePass1',
};

const cyclist2 = {
  firstName: 'Bob',
  lastName: 'Smith',
  email: 'bob@example.com',
  password: 'SecurePass1',
};

const createRoute = async (token) => {
  const res = await request(app)
    .post('/api/routes')
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Test Route',
      description: 'A test route for rides',
      startPoint: { lat: 51.505, lng: -0.09 },
      endPoint: { lat: 51.51, lng: -0.08 },
      distance: 5,
      difficulty: 'easy',
    });
  return res.body.data.route._id;
};

describe('POST /api/rides/start', () => {
  it('should create an active ride', async () => {
    const { token } = await registerAndLogin(cyclist);
    const routeId = await createRoute(token);

    const res = await request(app)
      .post('/api/rides/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ route: routeId });

    expect(res.status).toBe(201);
    expect(res.body.data.ride.status).toBe('active');
    expect(res.body.data.ride.startedAt).toBeDefined();
  });

  it('should return 401 without auth', async () => {
    const res = await request(app)
      .post('/api/rides/start')
      .send({ route: '507f1f77bcf86cd799439011' });

    expect(res.status).toBe(401);
  });

  it('should return 400 for missing route ID', async () => {
    const { token } = await registerAndLogin(cyclist);

    const res = await request(app)
      .post('/api/rides/start')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('should return 404 for non-existent route', async () => {
    const { token } = await registerAndLogin(cyclist);

    const res = await request(app)
      .post('/api/rides/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ route: new mongoose.Types.ObjectId().toString() });

    expect(res.status).toBe(404);
  });

  it('should return 409 if already has active ride', async () => {
    const { token } = await registerAndLogin(cyclist);
    const routeId = await createRoute(token);

    await request(app)
      .post('/api/rides/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ route: routeId });

    const res = await request(app)
      .post('/api/rides/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ route: routeId });

    expect(res.status).toBe(409);
  });
});

describe('PATCH /api/rides/:id/complete', () => {
  it('should complete a ride with stats', async () => {
    const { token } = await registerAndLogin(cyclist);
    const routeId = await createRoute(token);

    const startRes = await request(app)
      .post('/api/rides/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ route: routeId });

    const rideId = startRes.body.data.ride._id;

    const res = await request(app)
      .patch(`/api/rides/${rideId}/complete`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.ride.status).toBe('completed');
    expect(res.body.data.ride.co2Saved).toBeGreaterThan(0);
    expect(res.body.data.ride.pointsEarned).toBe(10);
    expect(res.body.data.ride.duration).toBeGreaterThanOrEqual(0);
  });

  it('should increment user totalPoints and totalDistance', async () => {
    const { token, user } = await registerAndLogin(cyclist);
    const routeId = await createRoute(token);

    const startRes = await request(app)
      .post('/api/rides/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ route: routeId });

    const rideId = startRes.body.data.ride._id;

    await request(app)
      .patch(`/api/rides/${rideId}/complete`)
      .set('Authorization', `Bearer ${token}`);

    const updatedUser = await User.findById(user._id);
    expect(updatedUser.totalPoints).toBeGreaterThan(0);
    expect(updatedUser.totalDistance).toBeGreaterThan(0);
  });

  it('should return 404 for non-existent ride', async () => {
    const { token } = await registerAndLogin(cyclist);

    const res = await request(app)
      .patch(`/api/rides/${new mongoose.Types.ObjectId()}/complete`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('should return 403 for another user ride', async () => {
    const { token } = await registerAndLogin(cyclist);
    const { token: token2 } = await registerAndLogin(cyclist2);
    const routeId = await createRoute(token);

    const startRes = await request(app)
      .post('/api/rides/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ route: routeId });

    const rideId = startRes.body.data.ride._id;

    const res = await request(app)
      .patch(`/api/rides/${rideId}/complete`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/rides/:id/cancel', () => {
  it('should cancel an active ride', async () => {
    const { token } = await registerAndLogin(cyclist);
    const routeId = await createRoute(token);

    const startRes = await request(app)
      .post('/api/rides/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ route: routeId });

    const rideId = startRes.body.data.ride._id;

    const res = await request(app)
      .patch(`/api/rides/${rideId}/cancel`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.ride.status).toBe('cancelled');
  });

  it('should return 400 for already completed ride', async () => {
    const { token } = await registerAndLogin(cyclist);
    const routeId = await createRoute(token);

    const startRes = await request(app)
      .post('/api/rides/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ route: routeId });

    const rideId = startRes.body.data.ride._id;

    await request(app)
      .patch(`/api/rides/${rideId}/complete`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .patch(`/api/rides/${rideId}/cancel`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});

describe('GET /api/rides', () => {
  it('should list rides with pagination', async () => {
    const { token } = await registerAndLogin(cyclist);
    const routeId = await createRoute(token);

    await request(app)
      .post('/api/rides/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ route: routeId });

    const res = await request(app)
      .get('/api/rides')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.pagination).toBeDefined();
  });

  it('should filter by status', async () => {
    const { token } = await registerAndLogin(cyclist);
    const routeId = await createRoute(token);

    const startRes = await request(app)
      .post('/api/rides/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ route: routeId });

    await request(app)
      .patch(`/api/rides/${startRes.body.data.ride._id}/complete`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get('/api/rides?status=completed')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].status).toBe('completed');
  });
});

describe('GET /api/rides/stats', () => {
  it('should return ride stats', async () => {
    const { token } = await registerAndLogin(cyclist);
    const routeId = await createRoute(token);

    const startRes = await request(app)
      .post('/api/rides/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ route: routeId });

    await request(app)
      .patch(`/api/rides/${startRes.body.data.ride._id}/complete`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app)
      .get('/api/rides/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.stats.ridesCompleted).toBe(1);
    expect(res.body.data.stats.totalCo2Saved).toBeGreaterThan(0);
    expect(res.body.data.stats.totalDistance).toBeGreaterThan(0);
  });
});

describe('GET /api/rides/active', () => {
  it('should return active ride', async () => {
    const { token } = await registerAndLogin(cyclist);
    const routeId = await createRoute(token);

    await request(app)
      .post('/api/rides/start')
      .set('Authorization', `Bearer ${token}`)
      .send({ route: routeId });

    const res = await request(app)
      .get('/api/rides/active')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.ride).toBeDefined();
    expect(res.body.data.ride.status).toBe('active');
  });

  it('should return null when no active ride', async () => {
    const { token } = await registerAndLogin(cyclist);

    const res = await request(app)
      .get('/api/rides/active')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.ride).toBeNull();
  });
});
