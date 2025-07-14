const { Review, User, Recipe } = require('../Models');

// Add a review
const addReview = async (req, res) => {
  try {
    const { recipeId, rating, comment } = req.body;
    const userId = req.user.id;
    if (!recipeId || !rating) {
      return res.status(400).json({ error: 'Recipe ID and rating are required.' });
    }
    // Prevent multiple reviews per user per recipe
    const existing = await Review.findOne({ where: { userId, recipeId } });
    if (existing) {
      return res.status(400).json({ error: 'You have already reviewed this recipe.' });
    }
    const review = await Review.create({ userId, recipeId, rating, comment });
    res.status(201).json(review);
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ error: 'Failed to add review.' });
  }
};

// Get all reviews for a recipe
const getReviewsForRecipe = async (req, res) => {
  try {
    const { recipeId } = req.params;

    const reviews = await Review.findAll({
      where: { recipeId },
      include: [{ model: User, attributes: ['id', 'username'] }], // <-- Only id and username
      order: [['createdAt', 'DESC']]
    });
    //console.log(reviews);
    res.json(reviews);
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
};

// Add this function above your module.exports
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('User in getUserReviews:', req.user.id);

    const reviews = await Review.findAll({
      where: { userId },
      include: [{ model: Recipe, attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });

    console.log(reviews);
    res.json(reviews);
  } catch (err) {
    console.error('Get user reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch user reviews.' });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;
    const review = await Review.findByPk(id);
    if (!review) return res.status(404).json({ error: 'Review not found.' });
    if (review.userId !== userId) return res.status(403).json({ error: 'Not authorized.' });
    review.rating = rating;
    review.comment = comment;
    await review.save();
    res.json(review);
  } catch (err) {
    console.error('Update review error:', err);
    res.status(500).json({ error: 'Failed to update review.' });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const review = await Review.findByPk(id);
    if (!review) return res.status(404).json({ error: 'Review not found.' });
    if (review.userId !== userId) return res.status(403).json({ error: 'Not authorized.' });
    await review.destroy();
    res.json({ message: 'Review deleted.' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ error: 'Failed to delete review.' });
  }
};

// Get average rating for a recipe
const getAverageRating = async (req, res) => {
  try {
    const { recipeId } = req.params;
    const result = await Review.findAll({
      where: { recipeId },
      attributes: [[require('sequelize').fn('AVG', require('sequelize').col('rating')), 'avgRating']],
    });
    const avgRating = result[0]?.dataValues?.avgRating || 0;
    res.json({ avgRating: Number(avgRating) });
  } catch (err) {
    console.error('Get average rating error:', err);
    res.status(500).json({ error: 'Failed to fetch average rating.' });
  }
};

module.exports = {
  addReview,
  getReviewsForRecipe,
  updateReview,
  deleteReview,
  getAverageRating,
  getUserReviews,
}; 