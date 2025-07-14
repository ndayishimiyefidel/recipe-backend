'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('WeeklyPlans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Admins',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      day: {
        type: Sequelize.STRING,
        allowNull: false
      },
      mealType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      recipeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Recipes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      weekStartDate: {
        type: Sequelize.DATE,
        allowNull: false
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

    // Add unique constraint
    await queryInterface.addIndex('WeeklyPlans', ['userId', 'day', 'mealType', 'weekStartDate'], {
      unique: true,
      name: 'weekly_plan_unique_constraint'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('WeeklyPlans');
  }
}; 