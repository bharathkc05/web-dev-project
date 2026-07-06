// server/src/routes/index.js
import { Router } from 'express';
import authRouter from '../modules/auth/auth.routes.js';
import userRouter from '../modules/users/user.routes.js';
import productRouter from '../modules/products/product.routes.js';
import orderRouter from '../modules/orders/order.routes.js';

const router = Router();

/**
 * GET /api/health
 * Returns service availability health checks
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Mount module routers
router.use('/auth', authRouter);
router.use('/products', productRouter);
router.use('/', userRouter);  // mounts /admin/users, /admin/outlets, etc.
router.use('/', orderRouter); // mounts /cart/add, /cart, /orders, etc.

export default router;
