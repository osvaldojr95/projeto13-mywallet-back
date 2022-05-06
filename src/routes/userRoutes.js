import express from 'express';
import { signUp, signIn, signOut } from ".././controllers/userController.js";

const router = express.Router();
router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/sign-out", signOut);

export default router;