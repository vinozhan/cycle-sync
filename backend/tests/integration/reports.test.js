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

const validReport = {
  title: 'Pothole on Main Street',
  description: 'Large pothole near the bike lane that could cause accidents.',
  category: 'pothole',
  severity: 'high',
  location: {
    lat: 51.505,
    lng: -0.09,
    address: '123 Main Street',
  },
};

describe('POST /api/reports', () => {
  it('should create a report for authenticated user', async () => {
    const { token } = await registerAndLogin(cyclist);
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send(validReport);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.report.title).toBe(validReport.title);
    expect(res.body.data.report.status).toBe('open');
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app).post('/api/reports').send(validReport);
    expect(res.status).toBe(401);
  });

  it('should return 400 for missing required fields', async () => {
    const { token } = await registerAndLogin(cyclist);
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Missing fields' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/reports', () => {
  it('should list reports for authenticated user', async () => {
    const { token } = await registerAndLogin(cyclist);
    await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send(validReport);

    const res = await request(app)
      .get('/api/reports')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.pagination).toBeDefined();
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app).get('/api/reports');
    expect(res.status).toBe(401);
  });

  it('should filter by severity', async () => {
    const { token } = await registerAndLogin(cyclist);
    await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send(validReport);
    await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validReport, title: 'Minor issue', severity: 'low' });

    const res = await request(app)
      .get('/api/reports?severity=high')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
  });
});

describe('GET /api/reports/:id', () => {
  it('should return report by ID', async () => {
    const { token } = await registerAndLogin(cyclist);
    const createRes = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send(validReport);
    const reportId = createRes.body.data.report._id;

    const res = await request(app)
      .get(`/api/reports/${reportId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.report.title).toBe(validReport.title);
  });
});

describe('PUT /api/reports/:id', () => {
  it('should update own open report', async () => {
    const { token } = await registerAndLogin(cyclist);
    const createRes = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send(validReport);
    const reportId = createRes.body.data.report._id;

    const res = await request(app)
      .put(`/api/reports/${reportId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated pothole report' });

    expect(res.status).toBe(200);
    expect(res.body.data.report.title).toBe('Updated pothole report');
  });
});

describe('DELETE /api/reports/:id', () => {
  it('should delete own report', async () => {
    const { token } = await registerAndLogin(cyclist);
    const createRes = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send(validReport);
    const reportId = createRes.body.data.report._id;

    const res = await request(app)
      .delete(`/api/reports/${reportId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('should allow admin to delete any report', async () => {
    const { token: cyclistToken } = await registerAndLogin(cyclist);
    const { token: adminToken } = await registerAndLogin(admin, 'admin');

    const createRes = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${cyclistToken}`)
      .send(validReport);
    const reportId = createRes.body.data.report._id;

    const res = await request(app)
      .delete(`/api/reports/${reportId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});

describe('PATCH /api/reports/:id/status', () => {
  it('should update status for admin', async () => {
    const { token: cyclistToken } = await registerAndLogin(cyclist);
    const { token: adminToken } = await registerAndLogin(admin, 'admin');

    const createRes = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${cyclistToken}`)
      .send(validReport);
    const reportId = createRes.body.data.report._id;

    const res = await request(app)
      .patch(`/api/reports/${reportId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'under_review', adminNotes: 'Investigating' });

    expect(res.status).toBe(200);
    expect(res.body.data.report.status).toBe('under_review');
    expect(res.body.data.report.adminNotes).toBe('Investigating');
  });

  it('should return 403 for non-admin', async () => {
    const { token } = await registerAndLogin(cyclist);
    const createRes = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${token}`)
      .send(validReport);
    const reportId = createRes.body.data.report._id;

    const res = await request(app)
      .patch(`/api/reports/${reportId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'resolved' });

    expect(res.status).toBe(403);
  });
});
