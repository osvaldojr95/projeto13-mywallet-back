import express from 'express';
import { addBalance, listBalance } from "./../controllers/balanceController.js";

const router = express.Router();
router.post("/balance", addBalance);
router.get("/balance", listBalance);

export default router;