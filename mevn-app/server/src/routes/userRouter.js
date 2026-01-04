import express from "express";
import User from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../services/emailService.js";

const router = express.Router();

// REGISTRATION 
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if the email or username already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: "Email or Username already in use." });
        }

        // HASHING
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

     
        const newUser = new User({ 
            username, 
            email, 
            password: hashedPassword 
        });
        
        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });

    } catch (err) {
        res.status(500).json({ error: "Server error during registration: " + err.message });
    }
});

// LOGIN 

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if the user exists in MongoDB Atlas
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Compare the actualy password with the hashed password in the DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Generate a JWT
       
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET || "your_temporary_secret_key", 
            { expiresIn: "24h" }
        );

       
        const { password: _, ...userData } = user._doc;

      
        res.status(200).json({ 
            message: "Login successful", 
            token: token, 
            user: userData 
        });

    } catch (err) {
        
        res.status(500).json({ error: "Server error during login: " + err.message });
    }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if email exists or not for security
            return res.status(200).json({ 
                message: "If that email exists, a password reset link has been sent." 
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

        // Save token to user
        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        // Send email with reset link
        try {
            await sendPasswordResetEmail(email, resetToken);
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
            // Still return success to user for security (don't reveal if email failed)
        }

        res.status(200).json({ 
            message: "If that email exists, a password reset link has been sent."
        });

    } catch (err) {
        res.status(500).json({ error: "Server error: " + err.message });
    }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: "Token and new password are required" });
        }

        // Find user with valid token
        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: "Invalid or expired reset token" });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password and clear reset token
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });

    } catch (err) {
        res.status(500).json({ error: "Server error: " + err.message });
    }
});

export default router;