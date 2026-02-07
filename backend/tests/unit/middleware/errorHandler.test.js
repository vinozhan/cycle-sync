import ApiError from '../../../src/utils/ApiError.js';
import errorHandler from '../../../src/middleware/errorHandler.js';

describe('errorHandler middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it('should handle ApiError', () => {
    const error = ApiError.badRequest('Invalid input', ['email required']);
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid input',
      errors: ['email required'],
    });
  });

  it('should omit errors array when empty on ApiError', () => {
    const error = ApiError.notFound('Not found');
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Not found',
      errors: undefined,
    });
  });

  it('should handle Mongoose ValidationError', () => {
    const error = {
      name: 'ValidationError',
      errors: {
        title: { message: 'Title is required' },
        email: { message: 'Email is invalid' },
      },
    };
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validation error',
      errors: ['Title is required', 'Email is invalid'],
    });
  });

  it('should handle Mongoose duplicate key error (11000)', () => {
    const error = { code: 11000, keyValue: { email: 'test@test.com' } };
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Duplicate value for field: email',
    });
  });

  it('should handle Mongoose CastError', () => {
    const error = { name: 'CastError', path: '_id', value: 'invalid-id' };
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid _id: invalid-id',
    });
  });

  it('should handle JsonWebTokenError', () => {
    const error = { name: 'JsonWebTokenError', message: 'jwt malformed' };
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid token',
    });
  });

  it('should handle TokenExpiredError', () => {
    const error = { name: 'TokenExpiredError', message: 'jwt expired' };
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token expired',
    });
  });

  it('should handle unknown errors with 500', () => {
    const error = new Error('Something went wrong');
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    );
  });
});
