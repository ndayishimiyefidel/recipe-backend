// const Alarm = require('../Models/Alarm');
// const Notification = require('../Models/Notification'); // Import Notification model
// const { Op } = require('sequelize');

// // Function to check and send notifications based on alarm times
// const checkAndSendNotifications = async() => {
//     const now = new Date(); // Current time in server's timezone
//     const formattedNow = now.toString(); // Log current time for debugging
//     console.log('Current server time:', formattedNow);

//     try {
//         const alarms = await Alarm.findAll({
//             where: {
//                 notification_time: {
//                     [Op.lte]: now, // Find alarms that should trigger
//                 },
//             },
//         });

//         for (const alarm of alarms) {
//             await Notification.create({
//                 message: `Your dish with ID ${alarm.recipe_id} is ready!`,
//                 createdAt: new Date(),
//             });
//             console.log(`Notification sent for recipe ID: ${alarm.recipe_id}`);

//             // Optionally, delete or mark the alarm as sent
//             await Alarm.destroy({ where: { id: alarm.id } });
//         }
//     } catch (error) {
//         console.error('Error sending notifications:', error);
//     }
// };

// // Call this function to check alarms periodically
// // setInterval(checkAndSendNotifications, 100); // Check every minute

// module.exports = { checkAndSendNotifications };