import { Request, Response, NextFunction } from "express";
import { randomBytes, createHash, timingSafeEqual } from "crypto";
import mongoose from "mongoose";
import Order from "../models/Order.model";
import Product from "../models/Product.model";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validators/order.validator";
import {
  initializePaystackTransaction,
  verifyPaystackTransaction,
} from "../services/paystack.service";
import { fulfillPaidOrder } from "../services/orderPayment.service";

const SHIPPING_FEE = Number(process.env.SHIPPING_FEE ?? 0);

// PUBLIC: Create an order (guest or authenticated customer)
function calculateEstimatedDeliveryDate(startDate = new Date()): Date {
  const deliveryDate = new Date(startDate);
  let businessDaysAdded = 0;

  while (businessDaysAdded < 5) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);

    const day = deliveryDate.getDay();

    // Sunday = 0, Saturday = 6
    if (day !== 0 && day !== 6) {
      businessDaysAdded++;
    }
  }

  return deliveryDate;
}
export const createOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = createOrderSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid order details",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    if (!Number.isFinite(SHIPPING_FEE) || SHIPPING_FEE < 0) {
      res.status(500).json({
        success: false,
        message: "Shipping fee is not configured correctly",
      });
      return;
    }

    const { items, customer, shippingAddress } = parsed.data;

    const quantities = new Map<string, number>();

    for (const item of items) {
      const current = quantities.get(item.productId) ?? 0;
      quantities.set(item.productId, current + item.quantity);
    }

    const productIds = [...quantities.keys()];

    const products = await Product.find({
      _id: { $in: productIds },
      status: "active",
    });

    if (products.length !== productIds.length) {
      res.status(400).json({
        success: false,
        message: "One or more products are unavailable",
      });
      return;
    }

    let subtotal = 0;
    const orderItems = [];

    for (const product of products) {
      const quantity = quantities.get(product._id.toString())!;

      if (quantity > product.stock) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
        return;
      }

      subtotal += product.price * quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0]?.url ?? "",
        sku: product.sku,
        quantity,
        price: product.price,
      });
    }

    const total = subtotal + SHIPPING_FEE;

    // Guest orders need a separate proof of ownership.
    const checkoutToken = req.user
      ? undefined
      : randomBytes(32).toString("hex");

    const order = await Order.create({
      user: req.user?.id,
      checkoutTokenHash: checkoutToken
        ? createHash("sha256").update(checkoutToken).digest("hex")
        : undefined,
      orderNumber: `VEL-${Date.now()}-${randomBytes(3).toString("hex").toUpperCase()}`,
      items: orderItems,
      customer,
      shippingAddress,
      subtotal,
      shippingFee: SHIPPING_FEE,
      discount: 0,
      total,
      paymentMethod: "paystack",
      paymentStatus: "pending",
      orderStatus: "pending",
      estimatedDeliveryDate: calculateEstimatedDeliveryDate(),
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        estimatedDeliveryDate: order.estimatedDeliveryDate,
      },
      // Returned only once. Never store or return the raw token from the database.
      ...(checkoutToken ? { checkoutToken } : {}),
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
    });
  }
};


// CUSTOMER: Get the logged-in customer's orders
export const getMyOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const orders = await Order.find({ user: req.user!.id })
      .sort({ createdAt: -1 })
      .select("-__v")
      .lean();

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get customer orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
    });
  }
};

// CUSTOMER: Get one of their own orders
export const getMyOrderById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
      return;
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user!.id,
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Get customer order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve order",
    });
  }
};

// ADMIN: View all orders
export const getAllOrders = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve orders",
    });
  }
};

// ADMIN: Update order fulfilment status
export const updateOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
      return;
    }

    const parsed = updateOrderStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Invalid order status",
        errors: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    if (order.paymentStatus !== "paid") {
      res.status(400).json({
        success: false,
        message: "Only paid orders can be processed for fulfilment",
      });
      return;
    }

    if (
      order.orderStatus === "delivered" ||
      order.orderStatus === "cancelled"
    ) {
      res.status(400).json({
        success: false,
        message: "This order can no longer be updated",
      });
      return;
    }

    order.orderStatus = parsed.data.orderStatus;
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
    });
  }
};


export const initializeOrderPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
      return;
    }

    // Load the guest token hash explicitly because its schema field is select:false.
    const order = await Order.findById(id).select("+checkoutTokenHash");

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    // Registered orders require the authenticated owner.
    if (order.user) {
      if (!req.user || order.user.toString() !== req.user.id) {
        res.status(404).json({
          success: false,
          message: "Order not found",
        });
        return;
      }
    } else {
      // Guest orders require the original checkout token.
      const checkoutToken = req.get("x-checkout-token");

      if (
        !checkoutToken ||
        !/^[a-f0-9]{64}$/i.test(checkoutToken) ||
        !order.checkoutTokenHash
      ) {
        res.status(403).json({
          success: false,
          message: "Valid checkout authorization is required",
        });
        return;
      }

      const suppliedHash = createHash("sha256")
        .update(checkoutToken)
        .digest("hex");

      const storedHash = Buffer.from(order.checkoutTokenHash, "hex");
      const suppliedHashBuffer = Buffer.from(suppliedHash, "hex");

      if (
        storedHash.length !== suppliedHashBuffer.length ||
        !timingSafeEqual(storedHash, suppliedHashBuffer)
      ) {
        res.status(403).json({
          success: false,
          message: "Invalid checkout authorization",
        });
        return;
      }
    }

    if (order.paymentStatus === "paid") {
      res.status(409).json({
        success: false,
        message: "This order has already been paid",
      });
      return;
    }

    if (
      order.paymentStatus === "failed" ||
      order.paymentStatus === "refunded" ||
      order.orderStatus === "cancelled"
    ) {
      res.status(400).json({
        success: false,
        message: "This order cannot be paid",
      });
      return;
    }

    // Do not silently replace an existing reference: an earlier Paystack
    // transaction may still complete and trigger a webhook.
    if (order.paymentReference) {
      res.status(409).json({
        success: false,
        message: "A payment attempt already exists for this order",
        reference: order.paymentReference,
      });
      return;
    }

    const reference = `VEL-${Date.now()}-${randomBytes(16).toString("hex")}`;

    order.paymentReference = reference;
    await order.save();

    try {
      const payment = await initializePaystackTransaction(
        order.customer.email,
        order.total,
        reference,
        order._id.toString()
      );

      res.status(200).json({
        success: true,
        message: "Payment initialized successfully",
        data: {
          orderId: order._id,
          reference: payment.reference,
          authorizationUrl: payment.authorization_url,
          accessCode: payment.access_code,
        },
      });
    } catch (error) {
      // Keep the reference. The request may have reached Paystack even if
      // our server did not receive its response.
      throw error;
    }
  } catch (error) {
    next(error);
  }
};


export const verifyOrderPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reference = Array.isArray(req.params.reference)
      ? req.params.reference[0]
      : req.params.reference;

    if (!reference || reference.length > 100) {
      res.status(400).json({
        success: false,
        message: "Invalid payment reference",
      });
      return;
    }

    const order = await Order.findOne({
      paymentReference: reference,
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order for this payment reference was not found",
      });
      return;
    }

    // Prevent processing an already-paid order again.
    if (order.paymentStatus === "paid") {
      res.status(200).json({
        success: true,
        message: "Payment has already been verified",
        data: {
          orderId: order._id,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
        },
      });
      return;
    }

    const payment = await verifyPaystackTransaction(reference);

    const expectedAmount = Math.round(order.total * 100);
    const expectedCurrency = process.env.CURRENCY || "NGN";

    if (
      payment.status !== "success" ||
      payment.reference !== order.paymentReference ||
      payment.amount !== expectedAmount ||
      payment.currency !== expectedCurrency
    ) {
      res.status(400).json({
        success: false,
        message: "Payment could not be verified",
      });
      return;
    }

    await fulfillPaidOrder(reference);

    // Fetch the latest order after fulfillment.
    const updatedOrder = await Order.findOne({
      paymentReference: reference,
    });

    if (!updatedOrder) {
      res.status(404).json({
        success: false,
        message: "Order could not be retrieved after payment verification",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: {
        orderId: updatedOrder._id,
        paymentStatus: updatedOrder.paymentStatus,
        orderStatus: updatedOrder.orderStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};
