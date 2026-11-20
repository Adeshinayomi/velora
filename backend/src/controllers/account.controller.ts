
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.model";

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: "customer" | "admin";
  };
}

const getUserId = (req: AuthRequest) => req.user?.id;

// UPDATE PROFILE
export const updateProfile = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = getUserId(req);
    const { firstName, lastName } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
};

// CHANGE PASSWORD
export const changePassword = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = getUserId(req);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both passwords are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to change password.",
    });
  }
};

// ADD ADDRESS
export const addAddress = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = getUserId(req);

    const {
      fullName,
      phone,
      street,
      city,
      state,
      country,
      postalCode,
      isDefault,
    } = req.body;

    if (
      !fullName ||
      !phone ||
      !street ||
      !city ||
      !state ||
      !country
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required address fields.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const shouldBeDefault =
      Boolean(isDefault) || user.addresses.length === 0;

    if (shouldBeDefault) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    user.addresses.push({
      fullName,
      phone,
      street,
      city,
      state,
      country,
      postalCode: postalCode || "",
      isDefault: shouldBeDefault,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Address added successfully.",
      addresses: user.addresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to add address.",
    });
  }
};

// UPDATE ADDRESS
export const updateAddress = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = getUserId(req);
    const { addressId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const address = user.addresses.find(
      (item) => String(item._id) === addressId
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    const {
      fullName,
      phone,
      street,
      city,
      state,
      country,
      postalCode,
      isDefault,
    } = req.body;

    if (fullName !== undefined) address.fullName = fullName;
    if (phone !== undefined) address.phone = phone;
    if (street !== undefined) address.street = street;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (country !== undefined) address.country = country;
    if (postalCode !== undefined) address.postalCode = postalCode;

    if (isDefault === true) {
      user.addresses.forEach((item) => {
        item.isDefault = String(item._id) === addressId;
      });
    } else if (isDefault === false && address.isDefault) {
      address.isDefault = false;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully.",
      addresses: user.addresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update address.",
    });
  }
};

// DELETE ADDRESS
export const deleteAddress = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = getUserId(req);
    const { addressId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const addressIndex = user.addresses.findIndex(
      (item) => String(item._id) === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    const wasDefault = user.addresses[addressIndex].isDefault;

    user.addresses.splice(addressIndex, 1);

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully.",
      addresses: user.addresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete address.",
    });
  }
};

// SET DEFAULT ADDRESS
export const setDefaultAddress = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const userId = getUserId(req);
    const { addressId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const address = user.addresses.find(
      (item) => String(item._id) === addressId
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    user.addresses.forEach((item) => {
      item.isDefault = String(item._id) === addressId;
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully.",
      addresses: user.addresses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to set default address.",
    });
  }
};
