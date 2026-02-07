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

const cyclistUser = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  password: 'SecurePass1',
};

const adminUser = {
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@example.com',
  password: 'AdminPass1',
};

const registerAndLogin = async (userData, role = 'cyclist') => {
  const res = await request(app)
    .post('/api/auth/register')
    .send(userData);
  if (role === 'admin') {
    await User.findOneAndUpdate({ email: userData.email }, { role: 'admin' });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: userData.email, password: userData.password });
    return { token: loginRes.body.data.accessToken, user: loginRes.body.data.user };
  }
  return { token: res.body.data.accessToken, user: res.body.data.user };
};

describe('GET /api/users', () => {
  it('should list users for admin', async () => {
    const { token } = await registerAndLogin(adminUser, 'admin');
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toBeDefined();
    expect(res.body.data.pagination).toBeDefined();
  });

  it('should return 403 for non-admin', async () => {
    const { token } = await registerAndLogin(cyclistUser);
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('should support pagination', async () => {
    const { token } = await registerAndLogin(adminUser, 'admin');
    const res = await request(app)
      .get('/api/users?page=1&limit=5')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.pagination.page).toBe(1);
    expect(res.body.data.pagination.limit).toBe(5);
  });
});

describe('GET /api/users/:id', () => {
  it('should return user by ID', async () => {
    const { token, user } = await registerAndLogin(cyclistUser);
    const dbUser = await User.findOne({ email: cyclistUser.email });

    const res = await request(app)
      .get(`/api/users/${dbUser._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(cyclistUser.email);
  });

  it('should return 404 for non-existent user', async () => {
    const { token } = await registerAndLogin(cyclistUser);
    const fakeId = '507f1f77bcf86cd799439011';

    const res = await request(app)
      .get(`/api/users/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('should return 400 for invalid mongo ID', async () => {
    const { token } = await registerAndLogin(cyclistUser);
    const res = await request(app)
      .get('/api/users/not-a-valid-id')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/users/:id', () => {
  it('should update own profile', async () => {
    const { token } = await registerAndLogin(cyclistUser);
    const dbUser = await User.findOne({ email: cyclistUser.email });

    const res = await request(app)
      .put(`/api/users/${dbUser._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Janet', bio: 'I love cycling' });

    expect(res.status).toBe(200);
    expect(res.body.data.user.firstName).toBe('Janet');
    expect(res.body.data.user.bio).toBe('I love cycling');
  });

  it('should not allow updating another user profile (non-admin)', async () => {
    await registerAndLogin(cyclistUser);
    const other = await registerAndLogin({
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@example.com',
      password: 'SecurePass1',
    });
    const dbUser = await User.findOne({ email: cyclistUser.email });

    const res = await request(app)
      .put(`/api/users/${dbUser._id}`)
      .set('Authorization', `Bearer ${other.token}`)
      .send({ firstName: 'Hacked' });

    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/users/change-password', () => {
  it('should change password with correct current password', async () => {
    const { token } = await registerAndLogin(cyclistUser);
    const res = await request(app)
      .patch('/api/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'SecurePass1', newPassword: 'NewSecure1' });

    expect(res.status).toBe(200);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: cyclistUser.email, password: 'NewSecure1' });
    expect(loginRes.status).toBe(200);
  });

  it('should return 400 for incorrect current password', async () => {
    const { token } = await registerAndLogin(cyclistUser);
    const res = await request(app)
      .patch('/api/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'WrongPass1', newPassword: 'NewSecure1' });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/users/:id (deactivate)', () => {
  it('should deactivate user for admin', async () => {
    const { token: adminToken } = await registerAndLogin(adminUser, 'admin');
    await registerAndLogin(cyclistUser);
    const dbUser = await User.findOne({ email: cyclistUser.email });

    const res = await request(app)
      .delete(`/api/users/${dbUser._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const updated = await User.findById(dbUser._id);
    expect(updated.isActive).toBe(false);
  });

  it('should return 403 for non-admin', async () => {
    const { token } = await registerAndLogin(cyclistUser);
    const dbUser = await User.findOne({ email: cyclistUser.email });

    const res = await request(app)
      .delete(`/api/users/${dbUser._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/users/:id/reactivate', () => {
  it('should reactivate user for admin', async () => {
    const { token: adminToken } = await registerAndLogin(adminUser, 'admin');
    await registerAndLogin(cyclistUser);
    const dbUser = await User.findOne({ email: cyclistUser.email });
    await User.findByIdAndUpdate(dbUser._id, { isActive: false });

    const res = await request(app)
      .patch(`/api/users/${dbUser._id}/reactivate`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const updated = await User.findById(dbUser._id);
    expect(updated.isActive).toBe(true);
  });
});

describe('GET /api/users/:id/stats', () => {
  it('should return user stats', async () => {
    const { token } = await registerAndLogin(cyclistUser);
    const dbUser = await User.findOne({ email: cyclistUser.email });

    const res = await request(app)
      .get(`/api/users/${dbUser._id}/stats`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.stats).toBeDefined();
  });
});

describe('GET /api/users/:id/achievements', () => {
  it('should return user achievements', async () => {
    const { token } = await registerAndLogin(cyclistUser);
    const dbUser = await User.findOne({ email: cyclistUser.email });

    const res = await request(app)
      .get(`/api/users/${dbUser._id}/achievements`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.achievements).toBeDefined();
  });
});
