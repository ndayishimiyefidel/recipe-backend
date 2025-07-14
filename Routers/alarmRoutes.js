const express = require('express');
const Notification = require('../Models/Notification');
const Recipe = require('../Models/Recipe');
const router = express.Router();
const cron = require('node-cron');
const { Op } = require('sequelize');
const axios = require('axios'); // Import axios for sending requests

// Create a notification
router.post('/alarm', async(req, res) => {
    const { recipeId, recipeName, recipeImage, scheduleTime, expoPushToken, mealType } = req.body;

    try {
        // Ensure all required fields are present
        if (!recipeId || !recipeName || !scheduleTime || !expoPushToken || !mealType) {
            return res.status(400).json({ error: 'Recipe ID, recipe name, scheduled time, Expo push token, and meal type are required' });
        }

        // Verify recipe exists
        const recipe = await Recipe.findByPk(recipeId);
        if (!recipe) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        // Create the notification in the database
        const notification = await Notification.create({
            recipeId,
            recipeName,
            recipeImage,
            scheduledTime: new Date(scheduleTime),
            status: 'pending',
            mealType,
            expoPushToken,
        });

        res.status(200).json(notification);
    } catch (error) {
        console.error('Error saving notification:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Retrieve all notifications with recipe details
router.get('/notifications', async(req, res) => {
    try {
        const notifications = await Notification.findAll({
            include: [{
                model: Recipe,
                attributes: ['name', 'imageUrl', 'culturalOrigin']
            }]
        });
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error retrieving notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE alarm by ID
router.delete('/notifications/:id', async(req, res) => {
    const alarmId = req.params.id;

    try {
        const result = await Notification.destroy({
            where: { id: alarmId }
        });

        if (result === 0) {
            return res.status(404).json({ message: 'Alarm not found' });
        }

        res.status(200).json({ message: 'Alarm deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting alarm', error: error.message });
    }
});

// Scheduler: Check for notifications every minute
cron.schedule('* * * * *', async() => {
    console.log('Checking for scheduled notifications...');

    try {
        const now = new Date();

        const notifications = await Notification.findAll({
            where: {
                scheduledTime: {
                    [Op.lte]: now,
                },
                status: 'pending',
            },
            include: [{
                model: Recipe,
                attributes: ['name', 'imageUrl']
            }]
        });

        for (const notification of notifications) {
            console.log(`Time to send notification for recipe: ${notification.recipeName}`);
            console.log('Expo Push Token:', notification.expoPushToken);

            const message = {
                to: notification.expoPushToken,
                sound: 'default',
                title: `Time to cook ${notification.recipeName}!`,
                body: `It's time for your ${notification.mealType.toLowerCase()} meal. Let's get cooking!`,
                data: { 
                    recipeImage: notification.recipeImage,
                    recipeName: notification.recipeName,
                    mealType: notification.mealType
                },
            };

            console.log('Sending notification with message:', JSON.stringify(message, null, 2));

            try {
                const response = await axios.post('https://exp.host/--/api/v2/push/send', message);
                console.log('Notification response:', response.data);

                if (response.data && response.data.data && response.data.data.id) {
                    await notification.update({ status: 'sent' });
                    console.log(`Notification sent successfully for ${notification.recipeName}`);
                } else {
                    console.error('Invalid notification response:', response.data);
                    await notification.update({ status: 'failed' });
                    console.error(`Failed to send notification for ${notification.recipeName}`);
                }
            } catch (err) {
                console.error('Error sending notification:', err);
                await notification.update({ status: 'failed' });
                console.error(`Failed to send notification for ${notification.recipeName}: ${err.message}`);
            }
        }
    } catch (error) {
        console.error('Error checking notifications:', error);
    }
});

module.exports = router;