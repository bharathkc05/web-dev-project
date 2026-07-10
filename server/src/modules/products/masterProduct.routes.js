import express from 'express';
import * as masterProductController from './masterProduct.controller.js';
import { authenticate } from '../../shared/middleware/authenticate.js';
import { authorize } from '../../shared/middleware/authorize.js';
import { ROLES } from '../../shared/constants/roles.js';
import { validateRequest, validateParams } from '../../shared/middleware/validate.js';
import { createMasterProductSchema, updateMasterProductSchema, idParamSchema } from './product.schema.js';
import upload from '../../shared/middleware/upload.js';

const router = express.Router();

// Admin only routes
router.use(authenticate, authorize(ROLES.ADMIN));

router.route('/')
  .get(masterProductController.getAllMasterProducts)
  .post(
    upload,
    validateRequest(createMasterProductSchema),
    masterProductController.createMasterProduct
  );

router.route('/:id')
  .put(
    upload,
    validateParams(idParamSchema),
    validateRequest(updateMasterProductSchema),
    masterProductController.updateMasterProduct
  )
  .delete(
    validateParams(idParamSchema),
    masterProductController.deleteMasterProduct
  );

router.route('/:id/status')
  .patch(
    validateParams(idParamSchema),
    masterProductController.toggleMasterProductStatus
  );

export default router;
