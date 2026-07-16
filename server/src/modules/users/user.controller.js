
import {
  deleteUser as deleteUserService,
  getAuditLogs as getAuditLogsService,
  getPlatformAnalytics as getPlatformAnalyticsService,
  getUsers as getUsersService,
  suspendUser as suspendUserService,
  unsuspendUser as unsuspendUserService,
  assignManager as assignManagerService,
} from './user.service.js';

export const getUsers = async (req, res) => {
  const result = await getUsersService(req.query, req.query.cursor);
  res.status(200).json({ success: true, data: result });
};

export const suspendUser = async (req, res) => {
  const result = await suspendUserService(req.params.id, req.user.userId, req.body.reason);
  res.status(200).json({ success: true, data: result });
};

export const unsuspendUser = async (req, res) => {
  const result = await unsuspendUserService(req.params.id, req.user.userId);
  res.status(200).json({ success: true, data: result });
};

export const assignManager = async (req, res) => {
  const result = await assignManagerService(req.params.id, req.body.outletId, req.user.userId);
  res.status(200).json({ success: true, data: result });
};

export const deleteUser = async (req, res) => {
  const result = await deleteUserService(req.params.id, req.user.userId);
  res.status(200).json({ success: true, data: result });
};


export const getPlatformAnalytics = async (req, res) => {
  const result = await getPlatformAnalyticsService();
  res.status(200).json({ success: true, data: result });
};

export const getAuditLogs = async (req, res) => {
  const result = await getAuditLogsService(req.query);
  res.status(200).json({ success: true, data: result });
};
