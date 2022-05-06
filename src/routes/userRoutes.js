import express from 'express';
import { signUpValidate, signInValidate } from ".././middlewares/userValidations.js";
import { signUp, signIn, signOut } from ".././controllers/userController.js";

const router = express.Router();
router.post("/sign-up", signUpValidate, signUp);
router.post("/sign-in", signInValidate, signIn);
router.post("/sign-out", signOut);

export default router;