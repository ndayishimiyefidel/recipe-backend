const Favorite = require('../Models/Favorite');
const Recipe = require('../Models/Recipe');

// Add a recipe to favorites
const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipeId } = req.body;
    if (!recipeId) return res.status(400).json({ error: 'Recipe ID is required' });
    // Prevent duplicates
    const [favorite, created] = await Favorite.findOrCreate({
      where: { userId, recipeId }
    });
    if (!created) return res.status(200).json({ message: 'Already favorited', favorite });
    res.status(201).json({ message: 'Recipe added to favorites', favorite });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
};

// Remove a recipe from favorites
const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipeId } = req.params;
    const deleted = await Favorite.destroy({ where: { userId, recipeId } });
    if (!deleted) return res.status(404).json({ error: 'Favorite not found' });
    res.json({ message: 'Recipe removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
};

// Get all favorite recipes for the user
const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const favorites = await Favorite.findAll({ where: { userId } });
    const recipeIds = favorites.map(fav => fav.recipeId);
    const recipes = await Recipe.findAll({ where: { id: recipeIds } });
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
};

module.exports = { addFavorite, removeFavorite, getFavorites }; 