export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 8;
};

export const validateRequired = (value) => {
  if (typeof value === 'string') return value.trim().length > 0;
  return value !== null && value !== undefined;
};

export const validateRating = (rating) => {
  const num = Number(rating);
  return Number.isInteger(num) && num >= 1 && num <= 5;
};

export const validateCoordinate = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

export const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors) return error.response.data.errors.join(', ');
  if (error.message) return error.message;
  return 'An unexpected error occurred';
};
