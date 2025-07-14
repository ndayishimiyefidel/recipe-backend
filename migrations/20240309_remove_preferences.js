'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // First, try to remove the foreign key constraint if it exists
      await queryInterface.removeConstraint('Recipes', 'Recipes_preferenceId_fkey');
    } catch (error) {
      console.log('Constraint removal skipped:', error.message);
    }

    try {
      // Remove the preferenceId column from Recipes table
      await queryInterface.removeColumn('Recipes', 'preferenceId');
    } catch (error) {
      console.log('Column removal skipped:', error.message);
    }

    try {
      // Drop the Preferences table if it exists
      await queryInterface.dropTable('Preferences');
    } catch (error) {
      console.log('Table drop skipped:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Recreate the Preferences table
    await queryInterface.createTable('Preferences', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      adminId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Admins',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add back the preferenceId column to Recipes table
    await queryInterface.addColumn('Recipes', 'preferenceId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Preferences',
        key: 'id'
      }
    });
  }
}; 