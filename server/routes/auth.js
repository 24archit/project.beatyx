const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const User = require("../models/user");

// Load the secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Signup route
router.post("/signup", async (req, res) => {
    const { username, name, email, password } = req.body;
    try {
        // Check if the user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, error: "User already exists with the same email" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        user = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
        });

        // Generate JWT token
        const payload = {
            user: {
                _id: user._id,
                name: user.name,
            },
        };
        const authtoken = JWT.sign(payload, JWT_SECRET); 

        // Return success response with token
        return res.status(201).json({
            success: true,
            user: { id: user._id, name: user.name, username: user.username, email: user.email },
            authtoken,
        });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

// Login route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, error: "Oops ! You have not registered with this email. Please register.." });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(402).json({ success: false, error: "Invalid password" });
        }

        // Generate JWT token
        const payload = {
            user: {
                id: user._id,
                name: user.name,
            },
        };

        const authtoken = JWT.sign(payload, JWT_SECRET); 
        return res.status(200).json({ success: true, authtoken });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
});

module.exports = router;
