import { Router } from "express";
import { currentUser, googleLogin, login, logout, register } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/me", requireAuth, currentUser);
router.post("/logout", logout);

export default router;
