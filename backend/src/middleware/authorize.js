import ApiError from '../utils/ApiError.js';

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action.'));
    }
    next();
  };
};

export default authorize;
