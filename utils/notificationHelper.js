const { Expo } = require('expo-server-sdk');
const Notification = require('../Models/Notification');
const { Op } = require('sequelize');

// Create a new Expo SDK client
const expo = new Expo();

// Function to schedule a notification
const scheduleNotification = async (notificationData) => {
    try {
        console.log('=== Scheduling Notification ===');
        console.log('Notification data:', JSON.stringify(notificationData, null, 2));

        const { userId, title, body, recipeId, recipeName, recipeImage, scheduledTime, mealType, expoPushToken } = notificationData;

        // Create notification record in database
        const notification = await Notification.create({
            userId,
            title,
            body,
            recipeId,
            recipeName,
            recipeImage,
            scheduledTime,
            mealType,
            expoPushToken,
            status: 'pending'
        });

        console.log('Notification scheduled successfully:', JSON.stringify(notification, null, 2));
        return notification;
    } catch (error) {
        console.error('Error scheduling notification:', error);
        throw error;
    }
};

// Function to send push notification
const sendPushNotification = async (pushToken, title, body, data = {}) => {
    try {
        console.log('=== Sending Push Notification ===');
        console.log('Push token:', pushToken);
        console.log('Title:', title);
        console.log('Body:', body);
        console.log('Data:', JSON.stringify(data, null, 2));

        // Check if the push token is valid
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            return false;
        }

        // Create the message
        const message = {
            to: pushToken,
            sound: 'default',
            title,
            body,
            data,
        };

        // Send the message
        const ticket = await expo.sendPushNotificationsAsync([message]);
        console.log('Push notification ticket:', JSON.stringify(ticket, null, 2));
        return ticket;
    } catch (error) {
        console.error('Error sending push notification:', error);
        throw error;
    }
};

// Function to process pending notifications
const processPendingNotifications = async () => {
    try {
        console.log('=== Processing Pending Notifications ===');
        console.log('Current time:', new Date().toISOString());

        const pendingNotifications = await Notification.findAll({
            where: {
                status: 'pending',
                scheduledTime: {
                    [Op.lte]: new Date() // Get notifications that are due
                }
            }
        });

        console.log(`Found ${pendingNotifications.length} pending notifications`);

        for (const notification of pendingNotifications) {
            try {
                console.log(`Processing notification ID: ${notification.id}`);
                console.log('Notification details:', JSON.stringify(notification, null, 2));

                if (notification.expoPushToken) {
                    const ticket = await sendPushNotification(
                        notification.expoPushToken,
                        notification.title,
                        notification.body,
                        {
                            recipeId: notification.recipeId,
                            recipeName: notification.recipeName,
                            mealType: notification.mealType
                        }
                    );

                    // Update notification status
                    await notification.update({
                        status: ticket ? 'sent' : 'failed'
                    });

                    console.log(`Notification ${notification.id} status updated to: ${ticket ? 'sent' : 'failed'}`);
                } else {
                    console.log(`Notification ${notification.id} has no push token, skipping`);
                }
            } catch (error) {
                console.error(`Error processing notification ${notification.id}:`, error);
                await notification.update({ status: 'failed' });
                console.log(`Notification ${notification.id} status updated to: failed`);
            }
        }
    } catch (error) {
        console.error('Error processing pending notifications:', error);
        throw error;
    }
};

module.exports = {
    scheduleNotification,
    sendPushNotification,
    processPendingNotifications
}; 