const User = require('./User');
const Recipe = require('./Recipe');
const Preference = require('./Preference');
const WeeklyPlan = require('./WeeklyPlan');
const Notification = require('./Notification');
const Favorite = require('./Favorite');
const Review = require('./Review');

// Define associations
User.hasMany(Preference, { foreignKey: 'userId' });
// Review associations
Review.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(Recipe, { foreignKey: 'recipeId' });
Recipe.hasMany(Review, { foreignKey: 'recipeId' });

module.exports = {
  User,
  Recipe,
  Preference,
  WeeklyPlan,
  Notification,
  Favorite,
  Review,
}; 