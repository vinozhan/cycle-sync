import ApiError from '../../../src/utils/ApiError.js';

describe('ApiError', () => {
  it('should create an error with statusCode, message, and errors', () => {
    const error = new ApiError(400, 'Bad request', ['field is required']);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Bad request');
    expect(error.errors).toEqual(['field is required']);
    expect(error.isOperational).toBe(true);
  });

  it('should default errors to empty array', () => {
    const error = new ApiError(500, 'Server error');
    expect(error.errors).toEqual([]);
  });

  describe('static factory methods', () => {
    it('badRequest should create 400 error', () => {
      const error = ApiError.badRequest('Invalid input', ['name required']);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
      expect(error.errors).toEqual(['name required']);
    });

    it('unauthorized should create 401 error', () => {
      const error = ApiError.unauthorized();
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Unauthorized');
    });

    it('unauthorized should accept custom message', () => {
      const error = ApiError.unauthorized('Token expired');
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Token expired');
    });

    it('forbidden should create 403 error', () => {
      const error = ApiError.forbidden();
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Forbidden');
    });

    it('notFound should create 404 error', () => {
      const error = ApiError.notFound();
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
    });

    it('notFound should accept custom message', () => {
      const error = ApiError.notFound('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('User not found');
    });

    it('conflict should create 409 error', () => {
      const error = ApiError.conflict('Email already exists');
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Email already exists');
    });

    it('internal should create 500 error', () => {
      const error = ApiError.internal();
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Internal server error');
    });
  });
});
