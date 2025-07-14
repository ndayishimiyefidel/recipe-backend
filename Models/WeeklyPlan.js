const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Recipe = require('./Recipe');
const User = require('./User');

class WeeklyPlan extends Model {}

WeeklyPlan.init({
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    day: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mealType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    recipeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Recipes',
            key: 'id'
        }
    },
    weekStartDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    reminderEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    reminderTime: {
        type: DataTypes.STRING,
        allowNull: true
    },
    reminderDays: {
        type: DataTypes.STRING,
        allowNull: true,
        get() {
            const value = this.getDataValue('reminderDays');
            return value ? value.split(',') : [];
        },
        set(value) {
            if (value && Array.isArray(value)) {
                this.setDataValue('reminderDays', value.join(','));
            } else {
                this.setDataValue('reminderDays', null);
            }
        }
    },
    expoPushToken: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'WeeklyPlan',
    tableName: 'weekly_plans',
    indexes: [
        {
            unique: true,
            fields: ['userId', 'day', 'mealType', 'weekStartDate']
        }
    ]
});

// Create relationships
User.hasMany(WeeklyPlan, { foreignKey: 'userId', onDelete: 'CASCADE' });
WeeklyPlan.belongsTo(User, { foreignKey: 'userId' });

Recipe.hasMany(WeeklyPlan, { foreignKey: 'recipeId', onDelete: 'CASCADE' });
WeeklyPlan.belongsTo(Recipe, { foreignKey: 'recipeId' });

module.exports = WeeklyPlan;