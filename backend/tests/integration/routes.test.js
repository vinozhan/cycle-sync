import request from 'supertest';
import app from '../../src/app.js';
import User from '../../src/models/User.js';
import Route from '../../src/models/Route.js';
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

const registerAndLogin = async (userData, role = 'cyclist') => {
  const res = await request(app).post('/api/auth/register').send(userData);
  if (role === 'admin') {
    await User.findOneAndUpdate({ email: userData.email }, { role: 'admin' });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: userData.email, password: userData.password });
    return { token: loginRes.body.data.accessToken, user: loginRes.body.data.user };
  }
  return { token: res.body.data.accessToken, user: res.body.data.user };
};

const cyclist = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  password: 'SecurePass1',
};

const admin = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@example.com',
  password: 'AdminPass1',
};

const validRoute = {
  title: 'City Park Loop',
  description: 'A scenic loop through the city park with dedicated bike lanes.',
  startPoint: { lat: 51.505, lng: -0.09 },
  endPoint: { lat: 51.51, lng: -0.08 },
  distance: 5.5,
  difficulty: 'easy',
  surfaceType: 'paved',
  city: 'London',
  country: 'UK',
};

describe('POST /api/routes', () => {
  it('should create a route for authenticated cyclist', async () => {
    const { token } = await registerAndLogin(cyclist);
    const res = await request(app)
      .post('/api/routes')
      .set('Authorization', `Bearer ${token}`)
      .send(validRoute);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.route.title).toBe(validRoute.title);
    expect(res.body.data.route.distance).toBe(validRoute.distance);
    expect(res.body.data.route.createdBy).toBeDefined();
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app)
      .post('/api/routes')
      .send(validRoute);

    expect(res.status).toBe(401);
  });

  it('should return 400 for missing required fields', async () => {
    const { token } = await registerAndLogin(cyclist);
    const res = await request(app)
      .post('/api/routes')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Missing fields' });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid difficulty', async () => {
    const { token } = await registerAndLogin(cyclist);
    const res = await request(app)
      .post('/api/routes')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validRoute, difficulty: 'impossible' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/routes', () => {
  it('should list routes (public, no auth required)', async () => {
    const { token } = await registerAndLogin(cyclist);
    await request(app)
      .post('/api/routes')
      .set('Authorization', `Bearer ${token}`)
      .send(validRoute);

    const res = await request(app).get('/api/routes');

    expect(res.status).toBe(200);
    expect(res.body.data.items).toBeDefined();
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.pagination).toBeDefined();
  });

  it('should support pagination', async () => {
    const res = await request(app).get('/api/routes?page=1&limit=5');
    expect(res.status).toBe(200);
    expect(res.body.data.pagination.page).toBe(1);
    expect(res.body.data.pagination.limit).toBe(5);
  });

  it('should filter by difficulty', async () => {
    const { token } = await registerAndLogin(cyclist);
    await request(app)
      .post('/api/routes')
      .set('Authorization', `Bearer ${token}`)
      .send(validRoute);
    await request(app)
      .post('/api/routes')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validRoute, title: 'Hard route', difficulty: 'hard' });

    const res = await request(app).get('/api/routes?difficulty=easy');
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].difficulty).toBe('easy');
  });
});

describe('GET /api/routes/:id', () => {
  it('should return a route by ID', async () => {
    const { token } = await registerAndLogin(cyclist);
    const createRes = await request(app)
      .post('/api/routes')
      .set('Authorization', `Bearer ${token}`)
      .send(validRoute);

    const routeId = createRes.body.data.route._id;
    const res = await request(app).get(`/api/routes/${routeId}`);

    expect(res.status).toBe(200);
    expect(res.body.data.route.title).toBe(validRoute.title);
  });

  it('should return 404 for non-existent route', async () => {
    const res = await request(app).get('/api/routes/507f1f77bcf86cd799439011');
    expect(res.status).toBe(404);
  });
});

describe('PUT /api/routes/:id', () => {
  it('should update own route', async () => {
    const { token } = await registerAndLogin(cyclist);
    const createRes = await request(app)
      .post('/api/routes')
      .set('Authorization', `Bearer ${token}`)
      .send(validRoute);
    const routeId = createRes.body.data.route._id;

    const res = await request(app)
      .put(`/api/routes/${routeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Park Loop' });

    expect(res.status).toBe(200);
    expect(res.body.data.route.title).toBe('Updated Park Loop');
  });

  it('should allow admin to update any route', async () => {
    const { token: cyclistToken } = await registerAndLogin(cyclist);
    const { token: adminToken } = await registerAndLogin(admin, 'admin');

    const createRes = await request(app)
      .post('/api/routes')
      .set('Authorization', `Bearer ${cyclistToken}`)
      .send(validRoute);
    const routeId = createRes.body.data.route._id;

    const res = await request(app)
      .put(`/api/routes/${routeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Admin Updated' });

    expect(res.status).toBe(200);
    expect(res.body.data.route.title).toBe('Admin Updated');
  });

  it('should not allow other cyclist to update route', async () => {
    const { token } = await registerAndLogin(cyclist);
    const other = await registerAndLogin({
      firstName: 'Bob', lastName: 'Smith',
      email: 'bob@example.com', password: 'SecurePass1',
    });

    const createRes = await request(app)
      .post('/api/routes')
      .set('Authorization', `Bearer ${token}`)
      .send(validRoute);
    const routeId = createRes.body.data.route._id;

    const res = await request(app)
      .put(`/api/routes/${routeId}`)
      .set('Authorization', `Bearer ${other.token}`)
      .send({ title: 'Hacked' });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/routes/:id', () => {
  it('should delete own route', async () => {
    const { token } = await registerAndLogin(cyclist);
    const createRes = await request(app)
      .post('/api/routes')
      .set('Authorization', `Bearer ${token}`)
      .send(validRoute);
    const routeId = createRes.body.data.route._id;

    const res = await request(app)
      .delete(`/api/routes/${routeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

describe('PATCH /api/routes/:id/verify', () => {
  it('should verify route for admin', async () => {
    const { token: cyclistToken } = await registerAndLogin(cyclist);
    const { token: adminToken } = await registerAndLogin(admin, 'admin');

    const createRes = await request(app)
      .post('/api/routes')
      .set('Authorization', `Bearer ${cyclistToken}`)
      .send(validRoute);
    const routeId = createRes.body.data.route._id;

    const res = await request(app)
      .patch(`/api/routes/${routeId}/verify`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.route.isVerified).toBe(true);
  });

  it('should return 403 for non-admin', async () => {
    const { token } = await registerAndLogin(cyclist);
    const createRes = await request(app)
      .post('/api/routes')
      .set('Authorization', `Bearer ${token}`)
      .send(validRoute);
    const routeId = createRes.body.data.route._id;

    const res = await request(app)
      .patch(`/api/routes/${routeId}/verify`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

describe('GET /api/routes/nearby', () => {
  it('should return empty array when no coordinates', async () => {
    const res = await request(app).get('/api/routes/nearby');
    expect(res.status).toBe(200);
    expect(res.body.data.items).toEqual([]);
  });
});
