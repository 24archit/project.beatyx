require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const User = require("../models/user");
const axios = require("axios");
// Load the secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
// Signup route
router.post("/signup", async (req, res) => {
  const { username, name, email, password, recaptchaToken } = req.body;

  // 1) Verify reCAPTCHA v3 token
  if (!recaptchaToken) {
    return res
      .status(400)
      .json({ success: false, error: "reCAPTCHA token is missing." });
  }

  try {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", recaptchaToken);

    const verificationRes = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      params
    );

    const { success, score, action } = verificationRes.data;
    // Optionally verify action === 'signup'
    if (!success || score < 0.5) {
      return res
        .status(401)
        .json({ success: false, error: "reCAPTCHA failed. Are you a bot?" });
    }
  } catch (err) {
    console.error("reCAPTCHA error:", err);
    return res
      .status(500)
      .json({ success: false, error: "reCAPTCHA verification error." });
  }

  // 2) Proceed with your existing signup logic
  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, error: "User already exists with that email" });
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
        id: user._id,
        name: user.name,
      },
    };
    const authtoken = JWT.sign(payload, process.env.JWT_SECRET);

    // Return success response with token
    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
      authtoken,
    });
  } catch (error) {
    console.error("Signup route error:", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({
          success: false,
          error:
            "Oops! You have not registered with this email. Please register.",
        });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(402)
        .json({ success: false, error: "Invalid password" });
    }

    // 3) On success, issue JWT
    const payload = {
      user: {
        id: user._id,
        name: user.name,
      },
    };
    const authtoken = JWT.sign(payload, process.env.JWT_SECRET);

    return res.status(200).json({ success: true, authtoken });
  } catch (error) {
    console.error("Login route error:", error.message);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
});

module.exports = router;
