import Report from '../models/Report.js';
import Route from '../models/Route.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { buildPagination, paginateResult } from '../utils/pagination.js';
import { POINTS, AUTO_RESOLVE_THRESHOLD } from '../utils/constants.js';
import { checkAndGrantRewards } from './rewardService.js';

export const create = async (reportData, userId) => {
  reportData.reportedBy = userId;

  if (reportData.route) {
    const route = await Route.findById(reportData.route);
    if (route && route.createdBy.toString() === userId) {
      throw ApiError.badRequest('You cannot report hazards on your own route');
    }
  }

  const report = await Report.create(reportData);

  await User.findByIdAndUpdate(userId, {
    $inc: { totalPoints: POINTS.REPORT_SUBMITTED },
  });

  try {
    await checkAndGrantRewards(userId);
  } catch {
    // Reward check failure should not block report creation
  }

  return report.populate([
    { path: 'reportedBy', select: 'firstName lastName avatar' },
    { path: 'route', select: 'title' },
  ]);
};

export const list = async (queryParams) => {
  const { page, limit, skip, sort } = buildPagination(queryParams);
  const filter = {};

  if (queryParams.category) {
    filter.category = queryParams.category;
  }

  if (queryParams.severity) {
    filter.severity = queryParams.severity;
  }

  if (queryParams.status) {
    filter.status = queryParams.status;
  }

  if (queryParams.route) {
    filter.route = queryParams.route;
  }

  if (queryParams.reportedBy) {
    filter.reportedBy = queryParams.reportedBy;
  }

  const [reports, total] = await Promise.all([
    Report.find(filter)
      .populate('reportedBy', 'firstName lastName avatar')
      .populate('route', 'title')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Report.countDocuments(filter),
  ]);

  return paginateResult(reports, total, page, limit);
};

export const getById = async (id) => {
  const report = await Report.findById(id)
    .populate('reportedBy', 'firstName lastName avatar')
    .populate('route', 'title')
    .populate('confirmations.user', 'firstName lastName');

  if (!report) {
    throw ApiError.notFound('Report not found');
  }
  return report;
};

export const update = async (id, updateData, userId) => {
  const report = await Report.findById(id);
  if (!report) {
    throw ApiError.notFound('Report not found');
  }

  if (report.reportedBy.toString() !== userId) {
    throw ApiError.forbidden('You can only update your own reports');
  }

  if (report.status !== 'open') {
    throw ApiError.badRequest('Can only edit reports with open status');
  }

  delete updateData.reportedBy;
  delete updateData.status;
  delete updateData.adminNotes;
  delete updateData.resolvedAt;

  Object.assign(report, updateData);
  await report.save();
  return report.populate([
    { path: 'reportedBy', select: 'firstName lastName avatar' },
    { path: 'route', select: 'title' },
  ]);
};

export const remove = async (id, userId, userRole) => {
  const report = await Report.findById(id);
  if (!report) {
    throw ApiError.notFound('Report not found');
  }

  if (report.reportedBy.toString() !== userId && userRole !== 'admin') {
    throw ApiError.forbidden('You can only delete your own reports');
  }

  await Report.findByIdAndDelete(id);
};

export const confirm = async (reportId, userId, status) => {
  const report = await Report.findById(reportId);
  if (!report) {
    throw ApiError.notFound('Report not found');
  }

  if (report.reportedBy.toString() === userId) {
    throw ApiError.forbidden('You cannot confirm your own report');
  }

  if (report.status === 'resolved' || report.status === 'dismissed') {
    throw ApiError.badRequest('Cannot confirm a report that is already resolved or dismissed');
  }

  const existing = report.confirmations.find(
    (c) => c.user.toString() === userId
  );

  if (existing) {
    existing.status = status;
  } else {
    report.confirmations.push({ user: userId, status });
    await User.findByIdAndUpdate(userId, {
      $inc: { totalPoints: POINTS.REPORT_CONFIRMED },
    });
  }

  const resolvedCount = report.confirmations.filter(
    (c) => c.status === 'resolved'
  ).length;

  if (resolvedCount >= AUTO_RESOLVE_THRESHOLD && report.status !== 'resolved') {
    report.status = 'resolved';
    report.adminNotes = report.adminNotes
      ? `${report.adminNotes}\nAuto-resolved by community confirmations.`
      : 'Auto-resolved by community confirmations.';
  }

  await report.save();

  return report.populate([
    { path: 'reportedBy', select: 'firstName lastName avatar' },
    { path: 'route', select: 'title' },
    { path: 'confirmations.user', select: 'firstName lastName' },
  ]);
};

const VALID_TRANSITIONS = {
  open: ['under_review', 'resolved', 'dismissed'],
  under_review: ['resolved', 'dismissed'],
  resolved: [],
  dismissed: [],
};

export const updateStatus = async (id, status, adminNotes) => {
  const report = await Report.findById(id);
  if (!report) {
    throw ApiError.notFound('Report not found');
  }

  const allowed = VALID_TRANSITIONS[report.status] || [];
  if (!allowed.includes(status)) {
    throw ApiError.badRequest(`Cannot transition from '${report.status}' to '${status}'`);
  }

  report.status = status;
  if (adminNotes !== undefined) {
    report.adminNotes = adminNotes;
  }

  await report.save();
  return report.populate([
    { path: 'reportedBy', select: 'firstName lastName avatar' },
    { path: 'route', select: 'title' },
  ]);
};
