const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

class Preference extends Model {}

Preference.init({
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'Preference',
    indexes: [
        {
            unique: true,
            fields: ['name', 'userId']
        }
    ]
});

// Create relationship with User
User.hasMany(Preference, { foreignKey: 'userId', onDelete: 'CASCADE' });
Preference.belongsTo(User, { foreignKey: 'userId' });

module.exports = Preference;