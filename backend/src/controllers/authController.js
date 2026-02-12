import * as authService from '../services/authService.js';
import ApiResponse from '../utils/ApiResponse.js';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV !== 'development',
  sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export const register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    ApiResponse.created(res, { user, accessToken }, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.login(req.body);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    ApiResponse.success(res, { user, accessToken }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    const { user, accessToken, refreshToken } = await authService.refresh(token);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
    ApiResponse.success(res, { user, accessToken }, 'Token refreshed');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.user.userId);
    res.clearCookie('refreshToken', { path: '/' });
    ApiResponse.success(res, null, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.userId);
    ApiResponse.success(res, { user });
  } catch (error) {
    next(error);
  }
};
