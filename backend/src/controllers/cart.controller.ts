
import { Response } from "express";
import mongoose from "mongoose";
import Cart from "../models/Cart.model";
import Product from "../models/Product.model";
import { AuthRequest } from "../middleware/auth.middleware";

// GET: Retrieve the authenticated customer's cart
export const getCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user!.id })
      .populate({
        path: "items.product",
        select: "name slug price images stock status",
      });

    res.status(200).json({
      success: true,
      cart: cart || { items: [] },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve cart",
    });
  }
};

// POST: Add a product to the cart
export const addToCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { productId, quantity } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    const product = await Product.findOne({
      _id: productId,
      status: "active",
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product not found or unavailable",
      });
      return;
    }

    let cart = await Cart.findOne({ user: req.user!.id });

    if (!cart) {
      cart = new Cart({
        user: req.user!.id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    const newQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    if (newQuantity > product.stock) {
      res.status(400).json({
        success: false,
        message: `Only ${product.stock} units are available`,
      });
      return;
    }

    if (existingItem) {
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: product._id,
        quantity,
      } as (typeof cart.items)[number]);
    }

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name slug price images stock status",
    });

    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add product to cart",
    });
  }
};

// PATCH: Update a cart item's quantity
export const updateCartItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    const cart = await Cart.findOne({ user: req.user!.id });

    if (!cart) {
      res.status(404).json({
        success: false,
        message: "Cart not found",
      });
      return;
    }

    const item = cart.items.find(
      (cartItem) => cartItem.product.toString() === productId
    );

    if (!item) {
      res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
      return;
    }

    const product = await Product.findOne({
      _id: productId,
      status: "active",
    });

    if (!product) {
      res.status(404).json({
        success: false,
        message: "Product is no longer available",
      });
      return;
    }

    if (quantity > product.stock) {
      res.status(400).json({
        success: false,
        message: `Only ${product.stock} units are available`,
      });
      return;
    }

    item.quantity = quantity;
    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name slug price images stock status",
    });

    res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart,
    });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update cart",
    });
  }
};

// DELETE: Remove one product from the cart
export const removeCartItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
      return;
    }

    const cart = await Cart.findOne({ user: req.user!.id });

    if (!cart) {
      res.status(404).json({
        success: false,
        message: "Cart not found",
      });
      return;
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name slug price images stock status",
    });

    res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Remove cart item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove product from cart",
    });
  }
};

// DELETE: Clear the entire cart
export const clearCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user!.id });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
    });
  }
};
