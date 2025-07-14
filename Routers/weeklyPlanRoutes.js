const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../Middleware/auth');
const { WeeklyPlan, Recipe } = require('../Models');
const { Op } = require('sequelize');
const { scheduleNotification } = require('../utils/notificationHelper');

// Apply auth middleware to all routes
router.use(authenticateToken);

// Get weekly plan
router.get('/', async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const weeklyPlan = await WeeklyPlan.findAll({
            where: { userId: req.user.id },
            include: ['recipe']
        });

        // Format the data for frontend
        const formattedPlan = weeklyPlan.reduce((acc, plan) => {
            if (!acc[plan.day]) {
                acc[plan.day] = {};
            }
            acc[plan.day][plan.mealType] = {
                recipe: plan.recipe,
                reminderEnabled: plan.reminderEnabled,
                reminderTime: plan.reminderTime
            };
            return acc;
        }, {});

        res.json(formattedPlan);
    } catch (error) {
        console.error('Error fetching weekly plan:', error);
        res.status(500).json({ error: 'Failed to fetch weekly plan' });
    }
});

// Add recipe to weekly plan
router.post('/', async (req, res) => {
    try {
        const { day, mealType, recipeId, reminderEnabled, reminderTime } = req.body;
        
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const plan = await WeeklyPlan.create({
            userId: req.user.id,
            day,
            mealType,
            recipeId,
            reminderEnabled,
            reminderTime
        });

        res.status(201).json(plan);
    } catch (error) {
        console.error('Error adding recipe to weekly plan:', error);
        res.status(500).json({ error: 'Failed to add recipe to weekly plan' });
    }
});

// Remove recipe from weekly plan
router.delete('/', async (req, res) => {
    try {
        const { day, mealType } = req.query;
        
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        await WeeklyPlan.destroy({
            where: {
                userId: req.user.id,
                day,
                mealType
            }
        });

        res.status(200).json({ message: 'Recipe removed from weekly plan' });
    } catch (error) {
        console.error('Error removing recipe from weekly plan:', error);
        res.status(500).json({ error: 'Failed to remove recipe from weekly plan' });
    }
});

// Get weekly plan for a user
router.get('/weekly-plan', async (req, res) => {
    try {
        const userId = req.user.id;
        const { weekStartDate } = req.query;

        //console.log('Backend: Received weekStartDate from frontend:', weekStartDate);

        const parsedWeekStartDate = weekStartDate ? new Date(weekStartDate) : new Date();
        // Set to start of the day (midnight) in local time to avoid timezone issues with database storage
        parsedWeekStartDate.setHours(0, 0, 0, 0);

        const nextWeekStartDate = new Date(parsedWeekStartDate);
        nextWeekStartDate.setDate(parsedWeekStartDate.getDate() + 7);

        const whereClause = {
            userId,
            weekStartDate: {
                [Op.gte]: parsedWeekStartDate, // Start of the week
                [Op.lt]: nextWeekStartDate // Up to (but not including) the start of the next week
            }
        };

      //  console.log('Backend: Weekly plan query where clause:', whereClause);

        const weeklyPlan = await WeeklyPlan.findAll({
            where: whereClause,
            include: [{
                model: Recipe,
                attributes: ['id', 'name', 'imageUrl', 'cookingTime', 'culturalOrigin', 'description', 'tags', 'balancedDiet', 'totalCalories']
            }],
            order: [
                ['day', 'ASC'],
                ['mealType', 'ASC']
            ]
        });

        // Format the response to match frontend structure
        const formattedPlan = weeklyPlan.reduce((acc, plan) => {
            //console.log('Backend: Processing raw plan entry (plan.toJSON()):', plan.toJSON());
            if (!acc[plan.day]) {
                acc[plan.day] = {
                    Breakfast: null,
                    Lunch: null,
                    Dinner: null
                };
            }
            acc[plan.day][plan.mealType] = {
                recipe: plan.Recipe || null,
                reminderEnabled: plan.reminderEnabled,
                reminderTime: plan.reminderTime,
                reminderDays: plan.reminderDays
            };
            return acc;
        }, {});

        // console.log('Backend: Fetched and formatted weekly plan:', JSON.stringify(formattedPlan, null, 2));
        res.json(formattedPlan);
    } catch (error) {
        console.error('Error fetching weekly plan:', error);
        res.status(500).json({ error: 'Failed to fetch weekly plan' });
    }
});

// Add recipe to weekly plan with reminder settings
router.post('/weekly-plan', async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            day, 
            mealType, 
            recipeId, 
            weekStartDate,
            reminderEnabled,
            reminderTime,
            reminderDays,
            expoPushToken
        } = req.body;

        // Check if slot is already taken
        const existingPlan = await WeeklyPlan.findOne({
            where: {
                userId,
                day,
                mealType,
                weekStartDate
            }
        });

      //  console.log(`Existing plan:, ${existingPlan}`);
        const planData = {
            userId,
            day,
            mealType,
            recipeId,
            weekStartDate,
            reminderEnabled: reminderEnabled || false,
            reminderTime: reminderTime || null,
            reminderDays: reminderEnabled && reminderDays ? reminderDays : null,
            expoPushToken: expoPushToken || null
        };

        let plan;
        if (existingPlan) {
            // Update existing plan
            plan = await existingPlan.update(planData);
        } else {
            // Create new plan
            plan = await WeeklyPlan.create(planData);
        }
        

        // Schedule notification if reminder is enabled
        if (reminderEnabled && reminderTime && expoPushToken) {
            const recipe = await Recipe.findByPk(recipeId);
            if (recipe) {
                await scheduleNotification({
                    userId,
                    recipeId,
                    title: `Time to cook ${recipe.name}!`,
                    body: `It's time to prepare your ${mealType.toLowerCase()} recipe.`,
                    recipeName: recipe.name,
                    recipeImage: recipe.imageUrl,
                    mealType,
                    scheduledTime: reminderTime,
                    expoPushToken
                });
            }
        }

        res.json({ message: 'Weekly plan updated successfully', plan });
    } catch (error) {
        console.error('Error updating weekly plan:', error);
        res.status(500).json({ error: 'Failed to update weekly plan' });
    }
});

// Update reminder settings for a meal
router.put('/weekly-plan/reminder', async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            day, 
            mealType, 
            weekStartDate,
            reminderEnabled,
            reminderTime,
            reminderDays,
            expoPushToken
        } = req.body;

        const plan = await WeeklyPlan.findOne({
            where: {
                userId,
                day,
                mealType,
                weekStartDate
            }
        });

        if (!plan) {
            return res.status(404).json({ error: 'Meal plan not found' });
        }

        await plan.update({
            reminderEnabled,
            reminderTime,
            reminderDays,
            expoPushToken
        });

        // Schedule or cancel notification based on reminder settings
        if (reminderEnabled && reminderTime && expoPushToken) {
            const recipe = await Recipe.findByPk(plan.recipeId);
            await scheduleNotification({
                userId,
                recipeId: plan.recipeId,
                recipeName: recipe.name,
                recipeImage: recipe.imageUrl,
                mealType,
                scheduleTime: reminderTime,
                reminderDays,
                expoPushToken
            });
        }

        res.json({ message: 'Reminder settings updated successfully' });
    } catch (error) {
        console.error('Error updating reminder settings:', error);
        res.status(500).json({ error: 'Failed to update reminder settings' });
    }
});

module.exports = router; 