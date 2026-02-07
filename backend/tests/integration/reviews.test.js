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
      description: 'A test route for reviews',
      startPoint: { lat: 51.505, lng: -0.09 },
      endPoint: { lat: 51.51, lng: -0.08 },
      distance: 5,
      difficulty: 'easy',
    });
  return res.body.data.route._id;
};

describe('POST /api/reviews', () => {
  it('should create a review for authenticated user', async () => {
    const { token } = await registerAndLogin(cyclist);
    const routeId = await createRoute(token);

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        route: routeId,
        rating: 4,
        title: 'Great route!',
        comment: 'Loved the scenery and safe bike lanes.',
        safetyScore: 5,
        sceneryScore: 4,
      });

    expect(res.status).toBe(201);
    expect(res.body.data.review.rating).toBe(4);
    expect(res.body.data.review.title).toBe('Great route!');
  });

  it('should return 401 when not authenticated', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({ route: '507f1f77bcf86cd799439011', rating: 4, title: 'Test', comment: 'Test' });

    expect(res.status).toBe(401);
  });

  it('should return 400 for missing required fields', async () => {
    const { token } = await registerAndLogin(cyclist);
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 4 });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid rating', async () => {
    const { token } = await registerAndLogin(cyclist);
    const routeId = await createRoute(token);

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ route: routeId, rating: 6, title: 'Test', comment: 'Test comment' });

    expect(res.status).toBe(400);
  });

  it('should not allow duplicate review on same route', async () => {
    const { token } = await registerAndLogin(cyclist);
    const routeId = await createRoute(token);

    const review = {
      route: routeId,
      rating: 4,
      title: 'Great route!',
      comment: 'Very nice cycling experience.',
    };

    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send(review);

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send(review);

    expect(res.status).toBe(409);
  });

  it('should update route average rating after review', async () => {
    const { token } = await registerAndLogin(cyclist);
    const { token: token2 } = await registerAndLogin(cyclist2);
    const routeId = await createRoute(token);

    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ route: routeId, rating: 4, title: 'Good', comment: 'Nice route' });

    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token2}`)
      .send({ route: routeId, rating: 2, title: 'OK', comment: 'Could be better' });

    const routeRes = await request(app).get(`/api/routes/${routeId}`);
    expect(routeRes.body.data.route.averageRating).toBe(3);
    expect(routeRes.body.data.route.reviewCount).toBe(2);
  });
});

describe('GET /api/reviews', () => {
  it('should list reviews (public)', async () => {
    const { token } = await registerAndLogin(cyclist);
    const routeId = await createRoute(token);
    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ route: routeId, rating: 5, title: 'Perfect', comment: 'Amazing route' });

    const res = await request(app).get('/api/reviews');

    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
    expect(res.body.data.pagination).toBeDefined();
  });

  it('should filter by route', async () => {
    const { token } = await registerAndLogin(cyclist);
    const routeId = await createRoute(token);
    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ route: routeId, rating: 5, title: 'Perfect', comment: 'Amazing route' });

    const res = await request(app).get(`/api/reviews?route=${routeId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(1);
  });
});

describe('GET /api/reviews/:id', () => {
  it('should return review by ID', async () => {
    const { token } = await registerAndLogin(cyclist);
    const routeId = await createRoute(token);
    const createRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ route: routeId, rating: 5, title: 'Perfect', comment: 'Amazing route' });
    const reviewId = createRes.body.data.review._id;

    const res = await request(app).get(`/api/reviews/${reviewId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.review.title).toBe('Perfect');
  });
});

describe('PUT /api/reviews/:id', () => {
  it('should update own review', async () => {
    const { token } = await registerAndLogin(cyclist);
    const routeId = await createRoute(token);
    const createRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ route: routeId, rating: 3, title: 'OK', comment: 'It was fine' });
    const reviewId = createRes.body.data.review._id;

    const res = await request(app)
      .put(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 4, comment: 'Actually it was good!' });

    expect(res.status).toBe(200);
    expect(res.body.data.review.rating).toBe(4);
    expect(res.body.data.review.isEdited).toBe(true);
  });

  it('should not allow other user to update review', async () => {
    const { token } = await registerAndLogin(cyclist);
    const { token: token2 } = await registerAndLogin(cyclist2);
    const routeId = await createRoute(token);
    const createRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ route: routeId, rating: 3, title: 'OK', comment: 'It was fine' });
    const reviewId = createRes.body.data.review._id;

    const res = await request(app)
      .put(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ rating: 1, comment: 'Hacked review' });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/reviews/:id', () => {
  it('should delete own review', async () => {
    const { token } = await registerAndLogin(cyclist);
    const routeId = await createRoute(token);
    const createRes = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({ route: routeId, rating: 5, title: 'Perfect', comment: 'Amazing route' });
    const reviewId = createRes.body.data.review._id;

    const res = await request(app)
      .delete(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
