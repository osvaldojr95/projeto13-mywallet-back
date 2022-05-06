import express from 'express';
import userRoutes from './userRoutes.js';
import balanceRoutes from './balanceRoutes.js';

const router = express.Router();
router.use(userRoutes);
router.use(balanceRoutes);
export default router;