
import mongoose from "mongoose";
import Order from "../models/Order.model";
import Product from "../models/Product.model";

export const fulfillPaidOrder = async (
  reference: string
): Promise<void> => {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const order = await Order.findOne({
        paymentReference: reference,
      }).session(session);

      if (!order) {
        throw new Error("Order not found for payment reference");
      }

      // Prevent duplicate inventory deductions.
      if (order.inventoryDeductedAt) {
        return;
      }

      for (const item of order.items) {
        const result = await Product.updateOne(
          {
            _id: item.product,
            stock: { $gte: item.quantity },
          },
          {
            $inc: { stock: -item.quantity },
          },
          { session }
        );

        if (result.modifiedCount !== 1) {
          throw new Error(
            `Insufficient stock for product ${item.name}`
          );
        }
      }

      order.paymentStatus = "paid";
      order.paidAt = order.paidAt || new Date();
      order.inventoryDeductedAt = new Date();

      await order.save({ session });
    });
  } finally {
    await session.endSession();
  }
};
