
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

import {
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/account.controller";


const router = Router();

router.patch("/profile", protect, updateProfile);
router.patch("/change-password", protect, changePassword);

router.post("/addresses", protect, addAddress);
router.patch("/addresses/:addressId", protect, updateAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);
router.patch(
  "/addresses/:addressId/default",
  protect,
  setDefaultAddress
);


router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
