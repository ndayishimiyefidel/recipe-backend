const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../Models/User');
const nodemailer = require('nodemailer');
require('dotenv').config();
const Preference = require('../Models/Preference');

// In-memory storage for OTPs
const otpStore = new Map();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Login
const login = async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Set token in cookie
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 3600000,
        });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                profile: user.profile
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed', details: err.message });
    }
};

// Register
const register = async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, preferences } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        if (preferences && Array.isArray(preferences)) {
            const preferenceRecords = preferences.map(preference => ({
                name: preference,
                userId: user.id,
            }));

            await Preference.bulkCreate(preferenceRecords);
        }

        res.status(201).json({ message: 'Registration successful', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

// Get User Profile
const getProfile = async(req, res) => {
    try {
        const { id } = req.user;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.status(200).json({
            username: user.username,
            email: user.email,
            profile: user.profile
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update User Profile
const updateProfile = async(req, res) => {
    const { username, email } = req.body;
    const profile = req.files && req.files[0] ? req.files[0].filename : null;

    try {
        const { id } = req.user;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.username = username || user.username;
        user.email = email || user.email;
        user.profile = profile || user.profile;
        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                username: user.username,
                email: user.email,
                profile: user.profile
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Change Password
const changePassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    try {
        const { id } = req.user;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Incorrect current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
};

// Logout
const logout = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
};

// Delete Account
const deleteAccount = async(req, res) => {
    try {
        const { id } = req.user;
        const user = await User.findByPk(id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        await user.destroy();
        res.clearCookie('token');
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    logout,
    deleteAccount,
    changePassword
};