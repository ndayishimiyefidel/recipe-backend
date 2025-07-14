const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Recipe = require('./Recipe');

class Favorite extends Model {}

Favorite.init({
 
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Users', key: 'id' }
  },
  recipeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Recipes', key: 'id' }
  }
}, { sequelize, modelName: 'Favorite' });

User.belongsToMany(Recipe, { through: Favorite, foreignKey: 'userId', as: 'favoriteRecipes' });
Recipe.belongsToMany(User, { through: Favorite, foreignKey: 'recipeId', as: 'usersWhoFavorited' });

module.exports = Favorite; 