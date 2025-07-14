const express = require('express');
const router = express.Router();
const Notification = require('../Models/Notification');
const { Expo } = require('expo-server-sdk');
const expo = new Expo();
const { authenticateToken } = require('../Middleware/auth');

// Apply auth middleware to all routes
router.use(authenticateToken);

// Create a new alarm
router.post('/alarm', async (req, res) => {
    try {
        const userId = req.user.id;
        const { recipeId, title, body, recipeName, recipeImage, scheduleTime, expoPushToken, mealType } = req.body;

        // Validate required fields
        if (!recipeId || !recipeName || !scheduleTime || !expoPushToken || !mealType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Create notification in database
        const notification = await Notification.create({
            userId,
            title: title || 'Meal Reminder',
            body,
            recipeId,
            recipeName,
            recipeImage,
            scheduledTime: new Date(scheduleTime),
            status: 'pending',
            mealType,
            expoPushToken
        });

        res.status(201).json(notification);
    } catch (error) {
        console.error('Error creating alarm:', error);
        res.status(500).json({ error: 'Failed to create alarm' });
    }
});

// Get notifications for the current user
router.get('/notifications', async (req, res) => {
    try {
        const userId = req.user.id;

        const notifications = await Notification.findAll({
            where: { userId },
            order: [['scheduledTime', 'DESC']]
        });

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Create a new notification
router.post('/notifications', async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, body, recipeId, recipeName, recipeImage, mealType, scheduledTime, expoPushToken } = req.body;

        // Validate expo push token
        if (!Expo.isExpoPushToken(expoPushToken)) {
            return res.status(400).json({ error: 'Invalid Expo push token' });
        }

        const notification = await Notification.create({
            userId,
            title,
            body,
            recipeId,
            recipeName,
            recipeImage,
            mealType,
            scheduledTime,
            expoPushToken,
            status: 'pending'
        });

        // Schedule the notification
        const message = {
            to: expoPushToken,
            sound: 'default',
            title,
            body,
            data: { recipeId, recipeName, recipeImage, mealType },
        };

        try {
            await expo.sendPushNotificationsAsync([message]);
            await notification.update({ status: 'sent' });
        } catch (error) {
            console.error('Error sending notification:', error);
            await notification.update({ status: 'failed' });
        }

        res.status(201).json(notification);
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(500).json({ error: 'Failed to create notification' });
    }
});

// Delete a notification
router.delete('/notifications/:id', async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;

        // Find the notification and ensure it belongs to the user
        const notification = await Notification.findOne({
            where: {
                id: notificationId,
                userId
            }
        });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found or unauthorized' });
        }

        await notification.destroy();
        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
});

// Update notification status
router.put('/notifications/:id/status', async (req, res) => {
    try {
        const userId = req.user.id;
        const notificationId = req.params.id;
        const { status } = req.body;

        // Find the notification and ensure it belongs to the user
        const notification = await Notification.findOne({
            where: {
                id: notificationId,
                userId
            }
        });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found or unauthorized' });
        }

        await notification.update({ status });
        res.json(notification);
    } catch (error) {
        console.error('Error updating notification status:', error);
        res.status(500).json({ error: 'Failed to update notification status' });
    }
});

// Get notifications by status for current user
router.get('/notifications/status/:status', async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.params;

        const notifications = await Notification.findAll({
            where: {
                userId,
                status
            },
            order: [['scheduledTime', 'DESC']]
        });

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications by status:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

module.exports = router; 