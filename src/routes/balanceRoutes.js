import express from 'express';
import { addBalance, listBalance, updateBalance, removeBalance } from "./../controllers/balanceController.js";

const router = express.Router();
router.post("/balance", addBalance);
router.get("/balance", listBalance);
router.put("/balance/:id/update", updateBalance);
router.delete("/balance/:id/delete", removeBalance);

export default router;