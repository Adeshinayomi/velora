
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.model";

type AuthRequest = Request & {
  user?: {
    id: string;
    role: "customer" | "admin";
  };
};

const getUserId = (req: AuthRequest) => req.user?.id;

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req as AuthRequest);
    const { firstName, lastName } = req.body;

    if (
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      !firstName.trim() ||
      !lastName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "First name and last name are required.",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        },
      },
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
      message: "Unable to update profile.",
    });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req as AuthRequest);
    const { currentPassword, newPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      newPassword.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide your current password and a new password of at least 8 characters.",
      });
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message: "Your current password is incorrect.",
      });
    }

    const samePassword = await bcrypt.compare(
      newPassword,
      user.password
    );

    if (samePassword) {
      return res.status(400).json({
        success: false,
        message: "Choose a password different from your current one.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to change password.",
    });
  }
};

export const addAddress = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req as AuthRequest);
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
      !fullName?.trim() ||
      !phone?.trim() ||
      !street?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !country?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete all required address fields.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const makeDefault =
      Boolean(isDefault) || user.addresses.length === 0;

    if (makeDefault) {
      user.addresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    user.addresses.push({
      fullName: fullName.trim(),
      phone: phone.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      postalCode: postalCode?.trim() || "",
      isDefault: makeDefault,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Address added successfully.",
      addresses: user.addresses,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to add address.",
    });
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req as AuthRequest);
    const { addressId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    const fields = [
      "fullName",
      "phone",
      "street",
      "city",
      "state",
      "country",
      "postalCode",
    ] as const;

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== "string") {
          return res.status(400).json({
            success: false,
            message: `Invalid ${field}.`,
          });
        }

        address[field] = req.body[field].trim();
      }
    }

    if (req.body.isDefault === true) {
      user.addresses.forEach((item) => {
        item.isDefault = item._id.toString() === addressId;
      });
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully.",
      addresses: user.addresses,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to update address.",
    });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req as AuthRequest);
    const { addressId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    const wasDefault = address.isDefault;

    address.deleteOne();

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully.",
      addresses: user.addresses,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to delete address.",
    });
  }
};

export const setDefaultAddress = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = getUserId(req as AuthRequest);
    const { addressId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    user.addresses.forEach((item) => {
      item.isDefault = item._id.toString() === addressId;
    });

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Default address updated.",
      addresses: user.addresses,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to set default address.",
    });
  }
};
