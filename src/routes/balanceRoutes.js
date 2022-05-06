import express from 'express';
import { addValidate, updateValidate } from ".././middlewares/balanceValidations.js";
import { addBalance, listBalance, updateBalance, removeBalance } from "./../controllers/balanceController.js";

const router = express.Router();
router.post("/balance", addValidate, addBalance);
router.get("/balance", listBalance);
router.put("/balance/:id/update", updateValidate, updateBalance);
router.delete("/balance/:id/delete", removeBalance);

export default router;