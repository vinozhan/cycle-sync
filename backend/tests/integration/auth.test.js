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

const validUser = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  password: 'SecurePass1',
};

describe('POST /api/auth/register', () => {
  it('should register a new user and return tokens', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user.role).toBe('cyclist');
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('should set refresh token cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    expect(res.status).toBe(201);
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c) => c.includes('refreshToken'))).toBe(true);
  });

  it('should return 409 if email already exists', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(validUser);
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.email).toBe(validUser.email);
  });

  it('should return 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'WrongPassword1' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 401 for non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'SecurePass1' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return 403 for deactivated user', async () => {
    await User.findOneAndUpdate({ email: validUser.email }, { isActive: false });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(403);
  });
});

describe('POST /api/auth/refresh', () => {
  it('should refresh access token with valid refresh token cookie', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    const cookies = registerRes.headers['set-cookie'];
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookies);

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('should return 401 when no refresh token', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('should logout authenticated user', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    const token = registerRes.body.data.accessToken;
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('should return current user profile', async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send(validUser);

    const token = registerRes.body.data.accessToken;
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user.firstName).toBe(validUser.firstName);
  });

  it('should return 401 without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
