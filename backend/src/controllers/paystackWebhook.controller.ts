
import { Request, Response, NextFunction } from "express";
import { createHmac, timingSafeEqual } from "crypto";
import Order from "../models/Order.model";
import { verifyPaystackTransaction } from "../services/paystack.service";
import { fulfillPaidOrder } from "../services/orderPayment.service";

export const paystackWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const signature = req.headers["x-paystack-signature"];
    const rawBody = (
      req as Request & { rawBody?: Buffer }
    ).rawBody;

    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (
      typeof signature !== "string" ||
      !rawBody ||
      !secret
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid webhook request",
      });
      return;
    }

    const expectedSignature = createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    const received = Buffer.from(signature, "hex");
    const expected = Buffer.from(expectedSignature, "hex");

    if (
      received.length !== expected.length ||
      !timingSafeEqual(received, expected)
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid webhook signature",
      });
      return;
    }

    const event = JSON.parse(rawBody.toString("utf8"));

    // Ignore events that do not concern successful charges.
    if (event.event !== "charge.success") {
      res.status(200).json({ received: true });
      return;
    }

    const reference = event.data?.reference;

    if (typeof reference !== "string" || !reference) {
      res.status(400).json({
        success: false,
        message: "Missing payment reference",
      });
      return;
    }

    const order = await Order.findOne({
      paymentReference: reference,
    });

    if (!order) {
      res.status(200).json({
        received: true,
        message: "No matching order found",
      });
      return;
    }

    // Verify directly with Paystack instead of trusting webhook data.
    const payment = await verifyPaystackTransaction(reference);

    const expectedAmount = Math.round(order.total * 100);
    const expectedCurrency = process.env.CURRENCY || "NGN";

    if (
      payment.status !== "success" ||
      payment.reference !== reference ||
      payment.amount !== expectedAmount ||
      payment.currency !== expectedCurrency
    ) {
      res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
      return;
    }

    await fulfillPaidOrder(reference);

    res.status(200).json({
      received: true,
      message: "Payment processed successfully",
    });
  } catch (error) {
    next(error);
  }
};
