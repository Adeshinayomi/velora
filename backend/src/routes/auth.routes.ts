
import { Router } from "express";
import {
  register,
  login,
  logout,
  getMe,
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";
import validate from "../middleware/validate.middleware";
import {
  registerSchema,
  loginSchema,
} from "../validators/auth.validator";
import { authLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
