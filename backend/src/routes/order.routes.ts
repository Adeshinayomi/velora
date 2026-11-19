
import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getMyOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller";
import {
  protect,
  optionalProtect,
  authorizeAdmin,
} from "../middleware/auth.middleware";
import {
  initializeOrderPayment,
  verifyOrderPayment,
} from "../controllers/order.controller";
import { paystackWebhook } from "../controllers/paystackWebhook.controller";


const router = Router();


// Guest or authenticated checkout
router.post("/", optionalProtect, createOrder);

// Customer order history
router.get("/my-orders", protect, getMyOrders);
router.get("/my-orders/:id", protect, getMyOrderById);

// Admin order management
router.get("/", protect, authorizeAdmin, getAllOrders);
router.patch("/:id/status", protect, authorizeAdmin, updateOrderStatus);

router.post("/:id/pay", optionalProtect, initializeOrderPayment);
router.post("/paystack/webhook", paystackWebhook);
router.get("/verify/:reference", verifyOrderPayment);

export default router;
