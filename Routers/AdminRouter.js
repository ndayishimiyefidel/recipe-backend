const express = require('express');
const router = express.Router();
const { register, login, forgetPassword, verifyOtp, getProfile, updateProfile, logout, deleteAccount, resetPassword, changePassword } = require('../Controllers/AdminController');
const authMiddleware = require('../Middleware/AdminAuth');

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/forget-password', forgetPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.put('/change-password', authMiddleware, changePassword);
router.post('/logout', authMiddleware, logout);
router.delete('/delete-account', authMiddleware, deleteAccount);

module.exports = router;