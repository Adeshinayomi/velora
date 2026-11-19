
import mongoose, { Document, Schema } from "mongoose";

interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  image: string;
  sku: string;
  quantity: number;
  price: number;
}

interface ICustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface IShippingAddress {
  address: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
}

export interface IOrder extends Document {
  user?: mongoose.Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
  customer: ICustomer;
  shippingAddress: IShippingAddress;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: "paystack";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentReference?: string;
  checkoutTokenHash?: string;
  orderStatus:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paidAt?: Date;
  estimatedDeliveryDate?: Date;
  inventoryDeductedAt?: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        image: {
          type: String,
          default: "",
        },
        sku: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    customer: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true },
    },

    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String },
      country: { type: String, required: true },
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingFee: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    checkoutTokenHash: {
        type: String,
        select: false,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["paystack"],
      default: "paystack",
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    paymentReference: {
      type: String,
      unique: true,
      sparse: true,
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    paidAt: {
      type: Date,
    },
    estimatedDeliveryDate: {
        type: Date,
        required: true,
    },
    inventoryDeductedAt: {
        type: Date,
        default: null,
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderStatus: 1 });

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
