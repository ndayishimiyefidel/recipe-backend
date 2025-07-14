'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, create the Users table if it doesn't exist
    try {
      await queryInterface.createTable('Users', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        username: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING,
          allowNull: false
        },
        email: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        profileImage: {
          type: Sequelize.STRING,
          allowNull: true
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
    } catch (error) {
      console.log('Users table already exists:', error.message);
    }

    // Create Preferences table if it doesn't exist
    try {
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
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Users',
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

      // Add unique constraint for name and userId
      await queryInterface.addIndex('Preferences', ['name', 'userId'], {
        unique: true,
        name: 'preferences_name_user_unique'
      });
    } catch (error) {
      console.log('Preferences table already exists:', error.message);
    }

    // Update foreign keys in other tables
    const tables = ['WeeklyPlans', 'Notifications'];
    
    for (const table of tables) {
      try {
        // Check if the table exists
        const [results] = await queryInterface.sequelize.query(
          `SELECT TABLE_NAME 
           FROM information_schema.TABLES 
           WHERE TABLE_NAME = '${table}'`
        );

        if (results && results.length > 0) {
          // Update userId column to reference Users table
          await queryInterface.changeColumn(table, 'userId', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'Users',
              key: 'id'
            }
          });
        }
      } catch (error) {
        console.log(`Skipping ${table} update:`, error.message);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    try {
      await queryInterface.dropTable('Preferences');
    } catch (error) {
      console.log('Preferences table drop skipped:', error.message);
    }

    try {
      await queryInterface.dropTable('Users');
    } catch (error) {
      console.log('Users table drop skipped:', error.message);
    }
  }
}; 