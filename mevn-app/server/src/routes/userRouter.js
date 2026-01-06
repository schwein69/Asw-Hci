import express from "express";
import User from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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



export default router;