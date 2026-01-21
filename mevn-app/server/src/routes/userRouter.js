import express from "express";
import User from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
  sendPasswordResetEmail,
  sendAccountSuspendedEmail,
  sendAccountReactivatedEmail,
} from "../services/emailService.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email or Username already in use." });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: "Standard",
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Server error during registration: " + err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.status === "suspended") {
      return res
        .status(403)
        .json({ error: "Account suspended. Please contact support." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "your_temporary_secret_key",
      { expiresIn: "24h" }
    );

    const { password: _, ...userData } = user._doc;

    res.status(200).json({
      message: "Login successful",
      token: token,
      user: userData,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Server error during login: " + err.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        message: "If that email exists, a password reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    try {
      await sendPasswordResetEmail(email, resetToken);
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    res.status(200).json({
      message: "If that email exists, a password reset link has been sent.",
    });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

router.post("/profile-image", authenticate, async (req, res) => {
  try {
    const { profileImage } = req.body;
    const userId = req.userId;

    if (!profileImage) {
      return res.status(400).json({ error: "Profile image is required" });
    }

    if (!profileImage.startsWith("data:image/")) {
      return res.status(400).json({ error: "Invalid image format" });
    }

    const base64Size = Buffer.byteLength(profileImage, "utf8");
    const maxSize = 5 * 1024 * 1024;

    if (base64Size > maxSize) {
      return res
        .status(400)
        .json({
          error:
            "Image size exceeds 5MB limit. Please compress or resize your image.",
        });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.profileImage = profileImage;
    await user.save();

    const { password: _, ...userData } = user._doc;

    res.status(200).json({
      message: "Profile image updated successfully",
      profileImage: user.profileImage,
      user: userData,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

router.delete("/profile-image", authenticate, async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.profileImage = undefined;
    await user.save();

    const { password: _, ...userData } = user._doc;

    res.status(200).json({
      message: "Profile image deleted successfully",
      user: userData,
    });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

router.post("/change-password", authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(403).json({ error: "Current password is incorrect" });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res
        .status(400)
        .json({
          error: "New password must be different from current password",
        });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

router.delete("/account", authenticate, async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.userId;

    if (!password) {
      return res
        .status(400)
        .json({ error: "Password is required to confirm account deletion" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(403).json({ error: "Invalid password" });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// Admin: get users list
router.get("/admin/users", authenticate, authorize("AdminGeneral"), async (req, res) => {
  try {
    const users = await User.find()
      .select("_id username email role status createdAt")
      .sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users: " + err.message });
  }
});

// Admin: update user status (suspend/activate)
router.patch("/:userId/status", authenticate, authorize("AdminGeneral"), async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.status = status;
    await user.save();

    if (status === "suspended") {
      try {
        await sendAccountSuspendedEmail(user.email, user.username);
      } catch (emailError) {
        console.error("Failed to send suspension email:", emailError);
      }
    } else if (status === "active") {
      try {
        await sendAccountReactivatedEmail(user.email, user.username);
      } catch (emailError) {
        console.error("Failed to send reactivation email:", emailError);
      }
    }

    res.status(200).json({
      message: "User status updated",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// Get all users (for report user dropdown)
router.get("/all", async (req, res) => {
  try {
    const users = await User.find()
      .select("_id username email")
      .sort({ username: 1 });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users: " + err.message });
  }
});

export default router;
