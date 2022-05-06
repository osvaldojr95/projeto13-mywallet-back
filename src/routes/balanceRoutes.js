import express from 'express';
import { addBalance } from "./../controllers/balanceController.js";

const router = express.Router();
router.post("/balance", addBalance);

export default router;