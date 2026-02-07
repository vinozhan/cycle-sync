import authorize from '../../../src/middleware/authorize.js';

describe('authorize middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {};
    next = jest.fn();
  });

  it('should call next with forbidden error when no user on req', () => {
    const middleware = authorize('admin');
    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        message: 'You do not have permission to perform this action.',
      })
    );
  });

  it('should call next with forbidden error when role not allowed', () => {
    req.user = { userId: '123', role: 'cyclist' };
    const middleware = authorize('admin');
    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 403 })
    );
  });

  it('should call next without error when role is allowed', () => {
    req.user = { userId: '123', role: 'admin' };
    const middleware = authorize('admin');
    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('should allow multiple roles', () => {
    req.user = { userId: '123', role: 'cyclist' };
    const middleware = authorize('admin', 'cyclist');
    middleware(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });
});
