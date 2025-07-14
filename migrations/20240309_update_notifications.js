'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, add the userId column if it doesn't exist
    try {
      await queryInterface.addColumn('Notifications', 'userId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Admins',
          key: 'id'
        },
        after: 'id'
      });
    } catch (error) {
      console.log('userId column already exists:', error.message);
    }

    // Update the status column to be an ENUM
    try {
      await queryInterface.changeColumn('Notifications', 'status', {
        type: Sequelize.ENUM('pending', 'sent', 'failed'),
        defaultValue: 'pending'
      });
    } catch (error) {
      console.log('Status column update skipped:', error.message);
    }

    // Make recipeId nullable
    try {
      await queryInterface.changeColumn('Notifications', 'recipeId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Recipes',
          key: 'id'
        }
      });
    } catch (error) {
      console.log('recipeId column update skipped:', error.message);
    }

    // Add title and body columns if they don't exist
    try {
      await queryInterface.addColumn('Notifications', 'title', {
        type: Sequelize.STRING,
        allowNull: false,
        after: 'userId'
      });
    } catch (error) {
      console.log('title column already exists:', error.message);
    }

    try {
      await queryInterface.addColumn('Notifications', 'body', {
        type: Sequelize.TEXT,
        allowNull: false,
        after: 'title'
      });
    } catch (error) {
      console.log('body column already exists:', error.message);
    }

    // Update recipeName and recipeImage to be nullable
    try {
      await queryInterface.changeColumn('Notifications', 'recipeName', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      console.log('recipeName column update skipped:', error.message);
    }

    try {
      await queryInterface.changeColumn('Notifications', 'recipeImage', {
        type: Sequelize.STRING,
        allowNull: true
      });
    } catch (error) {
      console.log('recipeImage column update skipped:', error.message);
    }

    // Add mealType column if it doesn't exist
    try {
      await queryInterface.addColumn('Notifications', 'mealType', {
        type: Sequelize.STRING,
        allowNull: true,
        after: 'recipeImage'
      });
    } catch (error) {
      console.log('mealType column already exists:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove added columns if they exist
    try {
      await queryInterface.removeColumn('Notifications', 'userId');
    } catch (error) {
      console.log('userId column removal skipped:', error.message);
    }

    try {
      await queryInterface.removeColumn('Notifications', 'title');
    } catch (error) {
      console.log('title column removal skipped:', error.message);
    }

    try {
      await queryInterface.removeColumn('Notifications', 'body');
    } catch (error) {
      console.log('body column removal skipped:', error.message);
    }

    try {
      await queryInterface.removeColumn('Notifications', 'mealType');
    } catch (error) {
      console.log('mealType column removal skipped:', error.message);
    }

    // Revert status column to STRING
    try {
      await queryInterface.changeColumn('Notifications', 'status', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'pending'
      });
    } catch (error) {
      console.log('status column revert skipped:', error.message);
    }

    // Revert recipeId to not nullable
    try {
      await queryInterface.changeColumn('Notifications', 'recipeId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Recipes',
          key: 'id'
        }
      });
    } catch (error) {
      console.log('recipeId column revert skipped:', error.message);
    }

    // Revert recipeName and recipeImage to not nullable
    try {
      await queryInterface.changeColumn('Notifications', 'recipeName', {
        type: Sequelize.STRING,
        allowNull: false
      });
    } catch (error) {
      console.log('recipeName column revert skipped:', error.message);
    }

    try {
      await queryInterface.changeColumn('Notifications', 'recipeImage', {
        type: Sequelize.TEXT,
        allowNull: false
      });
    } catch (error) {
      console.log('recipeImage column revert skipped:', error.message);
    }
  }
}; 