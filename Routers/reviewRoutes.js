const express = require('express');
const router = express.Router();
const { addReview, getReviewsForRecipe, updateReview, deleteReview, getAverageRating, getUserReviews } = require('../Controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');

// Add a review
router.post('/reviews', authenticateToken, addReview);
// Get all reviews by the current user (MUST come before /reviews/:recipeId)
router.get('/reviews/user', authenticateToken, getUserReviews);
// Get average rating for a recipe
router.get('/reviews/:recipeId/average', getAverageRating);
// Get all reviews for a recipe
router.get('/reviews/:recipeId', getReviewsForRecipe);
// Update a review
router.put('/reviews/:id', authenticateToken, updateReview);
// Delete a review
router.delete('/reviews/:id', authenticateToken, deleteReview);

module.exports = router; 