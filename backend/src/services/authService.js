import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import env from '../config/env.js';
import { JWT } from '../utils/constants.js';

const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    env.jwtAccessSecret,
    { expiresIn: JWT.ACCESS_EXPIRY }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id },
    env.jwtRefreshSecret,
    { expiresIn: JWT.REFRESH_EXPIRY }
  );
};

export const register = async ({ firstName, lastName, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const user = await User.create({ firstName, lastName, email, password });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save();

  return { user, accessToken, refreshToken };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Your account has been deactivated. Contact an administrator.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = await bcrypt.hash(refreshToken, 10);
  await user.save();

  return { user, accessToken, refreshToken };
};

export const refresh = async (token) => {
  if (!token) {
    throw ApiError.unauthorized('No refresh token provided');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtRefreshSecret);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.userId).select('+refreshToken');
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('User not found or deactivated');
  }

  if (!user.refreshToken) {
    throw ApiError.unauthorized('Refresh token has been revoked');
  }

  const isValid = await bcrypt.compare(token, user.refreshToken);
  if (!isValid) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  user.refreshToken = await bcrypt.hash(newRefreshToken, 10);
  await user.save();

  return { user, accessToken, refreshToken: newRefreshToken };
};

export const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

export const getMe = async (userId) => {
  const user = await User.findById(userId).populate('achievements');
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
};
