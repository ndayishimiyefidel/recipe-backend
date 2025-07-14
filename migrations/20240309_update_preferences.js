'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add description column
    try {
      await queryInterface.addColumn('Preferences', 'description', {
        type: Sequelize.TEXT,
        allowNull: true,
        after: 'name'
      });
    } catch (error) {
      console.log('Description column already exists:', error.message);
    }

    // Add unique constraint for name and userId combination
    try {
      await queryInterface.addIndex('Preferences', ['name', 'userId'], {
        unique: true,
        name: 'preferences_name_user_unique'
      });
    } catch (error) {
      console.log('Unique constraint already exists:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove description column
    try {
      await queryInterface.removeColumn('Preferences', 'description');
    } catch (error) {
      console.log('Description column removal skipped:', error.message);
    }

    // Remove unique constraint
    try {
      await queryInterface.removeIndex('Preferences', 'preferences_name_user_unique');
    } catch (error) {
      console.log('Unique constraint removal skipped:', error.message);
    }
  }
}; 