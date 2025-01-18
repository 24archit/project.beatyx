const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    followers: {
        type: Object
    },
    userType: {
        type: String
    },
    email: { 
        type: String,
        required: true,
        unique: true // Ensures that the email is unique
    },
    accessToken: {
        type: String
    },
    refreshToken: {
        type: String
    },
    expiryTime: {
        type: Number
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
