'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Notifications', 'recipeImage', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Notifications', 'recipeImage', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
}; 