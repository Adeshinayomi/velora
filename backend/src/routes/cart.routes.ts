
import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller";
import { protect } from "../middleware/auth.middleware";
import validate from "../middleware/validate.middleware";
import {
  addToCartSchema,
  updateCartItemSchema,
} from "../validators/cart.validator";

const router = Router();

// All cart endpoints require authentication
router.use(protect);

router.get("/", getCart);
router.post("/items", validate(addToCartSchema), addToCart);
router.patch(
  "/items/:productId",
  validate(updateCartItemSchema),
  updateCartItem
);
router.delete("/items/:productId", removeCartItem);
router.delete("/", clearCart);

export default router;
