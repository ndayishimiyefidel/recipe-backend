'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename the table
    await queryInterface.renameTable('Admins', 'Users');

    // Update foreign key references in other tables
    const tables = ['WeeklyPlans', 'Notifications', 'Preferences'];
    
    for (const table of tables) {
      try {
        // Get the current foreign key constraint name
        const [results] = await queryInterface.sequelize.query(
          `SELECT CONSTRAINT_NAME 
           FROM information_schema.TABLE_CONSTRAINTS 
           WHERE TABLE_NAME = '${table}' 
           AND CONSTRAINT_TYPE = 'FOREIGN KEY' 
           AND REFERENCED_TABLE_NAME = 'Admins'`
        );

        if (results && results.length > 0) {
          const constraintName = results[0].CONSTRAINT_NAME;
          
          // Drop the existing foreign key
          await queryInterface.removeConstraint(table, constraintName);
          
          // Add the new foreign key
          await queryInterface.addConstraint(table, {
            fields: ['userId'],
            type: 'foreign key',
            name: `${table}_userId_fkey`,
            references: {
              table: 'Users',
              field: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
          });
        }
      } catch (error) {
        console.log(`Skipping foreign key update for ${table}:`, error.message);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Update foreign key references back to Admins
    const tables = ['WeeklyPlans', 'Notifications', 'Preferences'];
    
    for (const table of tables) {
      try {
        // Get the current foreign key constraint name
        const [results] = await queryInterface.sequelize.query(
          `SELECT CONSTRAINT_NAME 
           FROM information_schema.TABLE_CONSTRAINTS 
           WHERE TABLE_NAME = '${table}' 
           AND CONSTRAINT_TYPE = 'FOREIGN KEY' 
           AND REFERENCED_TABLE_NAME = 'Users'`
        );

        if (results && results.length > 0) {
          const constraintName = results[0].CONSTRAINT_NAME;
          
          // Drop the existing foreign key
          await queryInterface.removeConstraint(table, constraintName);
          
          // Add the new foreign key
          await queryInterface.addConstraint(table, {
            fields: ['userId'],
            type: 'foreign key',
            name: `${table}_userId_fkey`,
            references: {
              table: 'Admins',
              field: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
          });
        }
      } catch (error) {
        console.log(`Skipping foreign key update for ${table}:`, error.message);
      }
    }

    // Rename the table back
    await queryInterface.renameTable('Users', 'Admins');
  }
}; 