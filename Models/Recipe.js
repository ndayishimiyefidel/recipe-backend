const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Preference = require('./Preference');

class Recipe extends Model {}

Recipe.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT('LONG'),
        allowNull: true,
    },
    ingredients: {
        type: DataTypes.TEXT('LONG'),
        allowNull: false,
    },
    imageUrl: {
        type: DataTypes.TEXT('LONG'),
        allowNull: true,
    },
    culturalOrigin: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    cookingTime: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    tags: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    balancedDiet: {
        type: DataTypes.JSON,
        allowNull: true,
        get() {
            const value = this.getDataValue('balancedDiet');
            return value ? JSON.parse(value) : null;
        },
        set(value) {
            this.setDataValue('balancedDiet', JSON.stringify(value));
        }
    },
    totalCalories: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    sequelize,
    modelName: 'Recipe',
});

// Create relationship with Preference
// Preference.hasMany(Recipe, { foreignKey: 'preferenceId' });
// Recipe.belongsTo(Preference, { foreignKey: 'preferenceId' });

module.exports = Recipe;