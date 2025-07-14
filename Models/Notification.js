const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

class Notification extends Model {}

Notification.init({
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    recipeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Recipes',
            key: 'id'
        }
    },
    recipeName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    recipeImage: {
        type: DataTypes.TEXT('LONG'),
        allowNull: true
    },
    mealType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    scheduledTime: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'sent', 'failed'),
        defaultValue: 'pending'
    },
    expoPushToken: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Notification'
});

// Create relationship with User
User.hasMany(Notification, { foreignKey: 'userId', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'userId' });

module.exports = Notification;