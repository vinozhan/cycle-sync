import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import auth from '../../../src/middleware/auth.js';

describe('auth middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {};
    next = jest.fn();
  });

  it('should call next with error when no authorization header', () => {
    auth(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Access denied. No token provided.',
      })
    );
  });

  it('should call next with error when header does not start with Bearer', () => {
    req.headers.authorization = 'Token abc123';
    auth(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 })
    );
  });

  it('should call next with error for invalid token', () => {
    req.headers.authorization = 'Bearer invalid-token';
    auth(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Invalid or expired token.',
      })
    );
  });

  it('should set req.user and call next for valid token', () => {
    const payload = { userId: '123', role: 'cyclist' };
    const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
    req.headers.authorization = `Bearer ${token}`;

    auth(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe('123');
    expect(req.user.role).toBe('cyclist');
    expect(next).toHaveBeenCalledWith();
  });

  it('should reject expired token', () => {
    const token = jwt.sign(
      { userId: '123', role: 'cyclist' },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '0s' }
    );
    req.headers.authorization = `Bearer ${token}`;

    auth(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 401 })
    );
  });
});
