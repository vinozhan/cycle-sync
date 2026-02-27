import * as reportService from '../services/reportService.js';
import ApiResponse from '../utils/ApiResponse.js';

export const create = async (req, res, next) => {
  try {
    const report = await reportService.create(req.body, req.user.userId);
    ApiResponse.created(res, { report }, 'Report submitted successfully');
  } catch (error) {
    next(error);
  }
};

export const list = async (req, res, next) => {
  try {
    const result = await reportService.list(req.query);
    ApiResponse.success(res, result);
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const report = await reportService.getById(req.params.id);
    ApiResponse.success(res, { report });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const report = await reportService.update(req.params.id, req.body, req.user.userId);
    ApiResponse.success(res, { report }, 'Report updated successfully');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    await reportService.remove(req.params.id, req.user.userId, req.user.role);
    ApiResponse.success(res, null, 'Report deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const confirm = async (req, res, next) => {
  try {
    const report = await reportService.confirm(
      req.params.id,
      req.user.userId,
      req.body.status
    );
    ApiResponse.success(res, { report }, 'Report confirmation recorded');
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const report = await reportService.updateStatus(
      req.params.id,
      req.body.status,
      req.body.adminNotes
    );
    ApiResponse.success(res, { report }, 'Report status updated');
  } catch (error) {
    next(error);
  }
};
