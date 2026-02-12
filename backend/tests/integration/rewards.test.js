import request from 'supertest';
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

const validReward = {
  name: 'First Route',
  description: 'Create your first cycling route',
  icon: 'trophy',
  category: 'routes',
  criteria: { type: 'routesCreated', threshold: 1 },
  pointsAwarded: 50,
  tier: 'bronze',
};

describe('POST /api/rewards', () => {
  it('should create a reward for admin', async () => {
    const { token } = await registerAndLogin(admin, 'admin');
    const res = await request(app)
      .post('/api/rewards')
      .set('Authorization', `Bearer ${token}`)
      .send(validReward);

    expect(res.status).toBe(201);
    expect(res.body.data.reward.name).toBe(validReward.name);
    expect(res.body.data.reward.tier).toBe('bronze');
  });

  it('should return 403 for non-admin', async () => {
    const { token } = await registerAndLogin(cyclist);
    const res = await request(app)
      .post('/api/rewards')
      .set('Authorization', `Bearer ${token}`)
      .send(validReward);

    expect(res.status).toBe(403);
  });

  it('should return 400 for missing required fields', async () => {
    const { token } = await registerAndLogin(admin, 'admin');
    const res = await request(app)
      .post('/api/rewards')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Missing fields' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/rewards', () => {
  it('should list rewards for authenticated user', async () => {
    const { token } = await registerAndLogin(admin, 'admin');
    await request(app)
      .post('/api/rewards')
      .set('Authorization', `Bearer ${token}`)
      .send(validReward);

    const res = await request(app)
      .get('/api/rewards')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.pagination).toBeDefined();
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app).get('/api/rewards');
    expect(res.status).toBe(401);
  });

  it('should filter by category', async () => {
    const { token } = await registerAndLogin(admin, 'admin');
    await request(app)
      .post('/api/rewards')
      .set('Authorization', `Bearer ${token}`)
      .send(validReward);
    await request(app)
      .post('/api/rewards')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validReward, name: 'Distance Pro', category: 'distance' });

    const res = await request(app)
      .get('/api/rewards?category=routes')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].category).toBe('routes');
  });

  it('should filter by tier', async () => {
    const { token } = await registerAndLogin(admin, 'admin');
    await request(app)
      .post('/api/rewards')
      .set('Authorization', `Bearer ${token}`)
      .send(validReward);
    await request(app)
      .post('/api/rewards')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validReward, name: 'Gold Route', tier: 'gold' });

    const res = await request(app)
      .get('/api/rewards?tier=bronze')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.items[0].tier).toBe('bronze');
  });
});

describe('GET /api/rewards/:id', () => {
  it('should return reward by ID', async () => {
    const { token } = await registerAndLogin(admin, 'admin');
    const createRes = await request(app)
      .post('/api/rewards')
      .set('Authorization', `Bearer ${token}`)
      .send(validReward);
    const rewardId = createRes.body.data.reward._id;

    const res = await request(app)
      .get(`/api/rewards/${rewardId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.reward.name).toBe(validReward.name);
  });

  it('should return 404 for non-existent reward', async () => {
    const { token } = await registerAndLogin(admin, 'admin');
    const res = await request(app)
      .get('/api/rewards/507f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

describe('PUT /api/rewards/:id', () => {
  it('should update reward for admin', async () => {
    const { token } = await registerAndLogin(admin, 'admin');
    const createRes = await request(app)
      .post('/api/rewards')
      .set('Authorization', `Bearer ${token}`)
      .send(validReward);
    const rewardId = createRes.body.data.reward._id;

    const res = await request(app)
      .put(`/api/rewards/${rewardId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ description: 'Updated description', pointsAwarded: 100 });

    expect(res.status).toBe(200);
    expect(res.body.data.reward.description).toBe('Updated description');
    expect(res.body.data.reward.pointsAwarded).toBe(100);
  });

  it('should return 403 for non-admin', async () => {
    const { token: adminToken } = await registerAndLogin(admin, 'admin');
    const { token: cyclistToken } = await registerAndLogin(cyclist);

    const createRes = await request(app)
      .post('/api/rewards')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validReward);
    const rewardId = createRes.body.data.reward._id;

    const res = await request(app)
      .put(`/api/rewards/${rewardId}`)
      .set('Authorization', `Bearer ${cyclistToken}`)
      .send({ description: 'Hacked' });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/rewards/:id', () => {
  it('should delete reward for admin', async () => {
    const { token } = await registerAndLogin(admin, 'admin');
    const createRes = await request(app)
      .post('/api/rewards')
      .set('Authorization', `Bearer ${token}`)
      .send(validReward);
    const rewardId = createRes.body.data.reward._id;

    const res = await request(app)
      .delete(`/api/rewards/${rewardId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('should return 403 for non-admin', async () => {
    const { token: adminToken } = await registerAndLogin(admin, 'admin');
    const { token: cyclistToken } = await registerAndLogin(cyclist);

    const createRes = await request(app)
      .post('/api/rewards')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validReward);
    const rewardId = createRes.body.data.reward._id;

    const res = await request(app)
      .delete(`/api/rewards/${rewardId}`)
      .set('Authorization', `Bearer ${cyclistToken}`);

    expect(res.status).toBe(403);
  });
});

describe('POST /api/rewards/check/:userId', () => {
  it('should check and grant rewards for admin', async () => {
    const { token: adminToken } = await registerAndLogin(admin, 'admin');
    const { token: cyclistToken } = await registerAndLogin(cyclist);
    const dbUser = await User.findOne({ email: cyclist.email });

    await request(app)
      .post('/api/rewards')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validReward);

    const res = await request(app)
      .post(`/api/rewards/check/${dbUser._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.granted).toBeDefined();
    expect(res.body.data.totalAchievements).toBeDefined();
  });

  it('should return 403 for non-admin', async () => {
    const { token } = await registerAndLogin(cyclist);
    const dbUser = await User.findOne({ email: cyclist.email });

    const res = await request(app)
      .post(`/api/rewards/check/${dbUser._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
