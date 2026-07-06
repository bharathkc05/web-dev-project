import AuditLog from '../models/auditLog.model.js';
import logger from '../utils/logger.js';

const getAuditPayload = (req, res, action, targetType) => {
  const auditContext = res.locals.auditLog || {};

  return {
    actorId: req.user.userId,
    role: req.user.role,
    action,
    targetType,
    targetId: auditContext.targetId || req.params?.id || req.body?.id || null,
    metadata: auditContext.metadata || {},
    createdAt: new Date(),
  };
};

const shouldWriteAuditLog = (req, res) => {
  if (!req.user?.userId || !req.user?.role) {
    return false;
  }

  return res.statusCode >= 200 && res.statusCode < 400;
};

const auditLog = (action, targetType) => (req, res, next) => {
  res.on('finish', () => {
    if (!shouldWriteAuditLog(req, res)) {
      return;
    }

    AuditLog.create(getAuditPayload(req, res, action, targetType)).catch((error) => {
      logger.error('Failed to write audit log', {
        action,
        targetType,
        actorId: req.user?.userId,
        message: error.message,
        stack: error.stack,
      });
    });
  });

  return next();
};

export default auditLog;
export { auditLog };
