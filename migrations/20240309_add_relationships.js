 'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add recipeId to Notifications table
    await queryInterface.addColumn('Notifications', 'recipeId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Recipes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Add preferenceId to Recipes table
    await queryInterface.addColumn('Recipes', 'preferenceId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Preferences',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove recipeId from Notifications table
    await queryInterface.removeColumn('Notifications', 'recipeId');

    // Remove preferenceId from Recipes table
    await queryInterface.removeColumn('Recipes', 'preferenceId');
  }
};