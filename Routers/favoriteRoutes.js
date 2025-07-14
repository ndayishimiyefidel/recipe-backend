const express = require('express');
const router = express.Router();
const { addFavorite, removeFavorite, getFavorites } = require('../Controllers/favoriteController');
const { authenticateToken } = require('../Middleware/auth');

// Add a favorite
router.post('/favorites', authenticateToken, addFavorite);
// Remove a favorite
router.delete('/favorites/:recipeId', authenticateToken, removeFavorite);
// Get all favorites for the user
router.get('/favorites', authenticateToken, getFavorites);

module.exports = router; 