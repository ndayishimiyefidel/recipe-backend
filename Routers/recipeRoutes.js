const express = require('express');
const router = express.Router();
const { fetchAndSaveRecipes, getAllRecipes, getRecipesByPreferences, deleteRecipe } = require('../Controllers/recipeController');
const Recipe = require('../Models/Recipe');
const { Op } = require('sequelize');
const { authenticateToken } = require('../Middleware/auth');

// Get all recipes
router.get('/recipes', getAllRecipes);

// Get recipes based on user preferences (requires authentication)
router.get('/recipes/preferences', authenticateToken, getRecipesByPreferences);

// Get recipes by cultural origin
router.get('/recipes/cultural/:origin', async (req, res) => {
    try {
        const { origin } = req.params;
        const recipes = await Recipe.findAll({
            where: {
                culturalOrigin: origin
            }
        });
        res.json(recipes);
    } catch (error) {
        console.error('Error fetching recipes by cultural origin:', error);
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
});

// Get all unique cultural origins
router.get('/recipes/cultural-origins', async (req, res) => {
    try {
        const recipes = await Recipe.findAll({
            attributes: ['culturalOrigin'],
            group: ['culturalOrigin'],
            where: {
                culturalOrigin: {
                    [Op.not]: null
                }
            }
        });
        const origins = recipes.map(recipe => recipe.culturalOrigin).filter(Boolean);
        res.json(origins);
    } catch (error) {
        console.error('Error fetching cultural origins:', error);
        res.status(500).json({ error: 'Failed to fetch cultural origins' });
    }
});

// Create recipes from ingredients (using Edamam API)
router.post('/recipes', fetchAndSaveRecipes);

// Update a recipe
router.put('/recipes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, ingredients, imageUrl, culturalOrigin, cookingTime, tags } = req.body;
        
        const recipe = await Recipe.findByPk(id);
        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        await recipe.update({
            name,
            description,
            ingredients,
            imageUrl,
            culturalOrigin,
            cookingTime,
            tags
        });

        res.json(recipe);
    } catch (error) {
        console.error('Error updating recipe:', error);
        res.status(500).json({ error: 'Failed to update recipe' });
    }
});

// Delete a recipe
router.delete('/recipes/:id', deleteRecipe);

// Search recipes by ingredients
router.post('/recipes/search', async (req, res) => {
    try {
        const { ingredients } = req.body;
        const recipes = await Recipe.findAll({
            where: {
                ingredients: {
                    [Op.or]: ingredients.map(ingredient => ({
                        [Op.like]: `%${ingredient}%`
                    }))
                }
            }
        });
        res.json(recipes);
    } catch (error) {
        console.error('Error searching recipes:', error);
        res.status(500).json({ error: 'Failed to search recipes' });
    }
});

module.exports = router;