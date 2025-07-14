const axios = require("axios");
const Recipe = require("../Models/Recipe");
const Preference = require("../Models/Preference");
const User = require("../Models/User");

const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;


const getRecipeSuggestions = async (ingredients) => {
  if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) {
    throw new Error("Edamam API credentials not configured");
  }

  const url = "https://api.edamam.com/api/recipes/v2";
  const params = {
    type: "public",
    q: ingredients.join(","),
    app_id: EDAMAM_APP_ID,
    app_key: EDAMAM_APP_KEY,
    from: 0,
    to: 15,
  };

  try {
    console.log("Fetching recipes from Edamam with ingredients:", ingredients);
    const response = await axios.get(url, { 
      params,
      headers: {
        'Edamam-Account-User': 'fidele'
      }
    });

    if (!response.data || !response.data.hits) {
      throw new Error("Invalid response from Edamam API");
    }

    return response.data.hits.map((hit) => {
      const recipe = hit.recipe;
      const totalNutrients = recipe.totalNutrients || {};

      // Convert ingredients array to string
      const ingredientsString = Array.isArray(recipe.ingredientLines) 
        ? recipe.ingredientLines.join('\n')
        : '';

      // Use the original Edamam image URL
      const imageUrl = recipe.image;

      return {
        name: recipe.label,
        description: recipe.label,
        culturalOrigin: Array.isArray(recipe.cuisineType) ? recipe.cuisineType.join(", ") : "Unknown",
        tags: Array.isArray(recipe.dishType) ? recipe.dishType.join(", ") : "General",
        ingredients: ingredientsString,
        imageUrl: recipe.image,
        cookingTime: recipe.totalTime ? `${recipe.totalTime}` : "N/A",
        totalCalories: totalNutrients.ENERC_KCAL ? `${totalNutrients.ENERC_KCAL.quantity.toFixed(2)} kcal` : "N/A",
        balancedDiet: {
          carbsPercentage: totalNutrients.CHOCDF ? `${totalNutrients.CHOCDF.quantity.toFixed(2)}` : "N/A",
          fatPercentage: totalNutrients.FAT ? `${totalNutrients.FAT.quantity.toFixed(2)}` : "N/A",
          proteinPercentage: totalNutrients.PROCNT ? `${totalNutrients.PROCNT.quantity.toFixed(2)}` : "N/A",
        }
      };
    });
  } catch (error) {
    console.error("Error fetching recipes from Edamam:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Could not fetch recipes from Edamam");
  }
};

const saveRecipes = async (recipes) => {
  try {
    const savedRecipes = [];
    for (const recipe of recipes) {
      const exists = await Recipe.findOne({ where: { name: recipe.name } });
      if (!exists) {
        const savedRecipe = await Recipe.create(recipe);
        savedRecipes.push(savedRecipe);
      } else {
        console.log(`Recipe "${recipe.name}" already exists. Skipping...`);
        savedRecipes.push(exists);
      }
    }
    return savedRecipes;
  } catch (error) {
    console.error("Error saving recipes:", error);
    throw new Error("Failed to save recipes to database");
  }
};

const fetchAndSaveRecipes = async (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: "No valid ingredients provided." });
  }

  try {
    console.log("Fetching recipes for ingredients:", ingredients);
    const recipeSuggestions = await getRecipeSuggestions(ingredients);
    
    if (!recipeSuggestions || recipeSuggestions.length === 0) {
      return res.status(404).json({ error: "No recipes found for the given ingredients." });
    }

    const savedRecipes = await saveRecipes(recipeSuggestions);
    return res.status(200).json(savedRecipes);
  } catch (error) {
    console.error("Error in fetchAndSaveRecipes:", error);
    return res.status(500).json({ 
      error: "Failed to fetch or save recipes",
      details: error.message 
    });
  }
};

const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findAll();
    console.log('All recipes from database:', JSON.stringify(recipes, null, 2));
    console.log('Number of recipes found:', recipes.length);
    
    // Debug each recipe's image URL
    recipes.forEach((recipe, index) => {
      console.log(`Recipe ${index + 1} from DB:`, {
        id: recipe.id,
        name: recipe.name,
        imageUrl: recipe.imageUrl,
        hasImageUrl: !!recipe.imageUrl,
        imageUrlType: typeof recipe.imageUrl
      });
    });
    
    return res.status(200).json(recipes);
  } catch (error) {
    console.error("Error fetching all recipes:", error);
    return res.status(500).json({ error: "Failed to fetch recipes" });
  }
};

// Get recipes based on user preferences
const getRecipesByPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's preferences
    const userPreferences = await Preference.findAll({
      where: { userId: userId },
      attributes: ['name']
    });
    
    if (!userPreferences || userPreferences.length === 0) {
      // If no preferences, return all recipes
      const allRecipes = await Recipe.findAll();
      return res.status(200).json(allRecipes);
    }
    
    const preferenceNames = userPreferences.map(pref => pref.name);
    console.log('User preferences:', preferenceNames);
    
    // Get recipes that match user preferences
    const recipes = await Recipe.findAll({
      where: {
        culturalOrigin: {
          [require('sequelize').Op.or]: preferenceNames.map(pref => ({
            [require('sequelize').Op.like]: `%${pref}%`
          }))
        }
      }
    });
    
    console.log(`Found ${recipes.length} recipes matching preferences:`, preferenceNames);
    
    return res.status(200).json(recipes);
  } catch (error) {
    console.error("Error fetching recipes by preferences:", error);
    return res.status(500).json({ error: "Failed to fetch recipes by preferences" });
  }
};

// Delete Recipe by ID
const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRecipe = await Recipe.findByIdAndDelete(id);
    if (!deletedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.status(200).json({ message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting recipe" });
  }
};

module.exports = {
  fetchAndSaveRecipes,
  getAllRecipes,
  getRecipesByPreferences,
  deleteRecipe,
};
