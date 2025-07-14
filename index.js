require('dotenv').config();
const express = require('express');
const sequelize = require('./config/database');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const User = require('./Models/User');
const Recipe = require('./Models/Recipe');
const Preference = require('./Models/Preference');
const WeeklyPlan = require('./Models/WeeklyPlan');
const Notification = require('./Models/Notification');
const { processPendingNotifications } = require('./utils/notificationHelper');
const reviewRoutes = require('./Routers/reviewRoutes');

const app = express();

// Rate limiter configuration - Increased for development
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased limit for development
    message: 'Too many requests from this IP, please try again later.'
});

// Middleware
// app.use(cors({
//     origin: 'http://localhost:3000',
//     credentials: true
// }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(limiter);
app.use(cors({
    origin: '*',
    credentials: true,
}));

// Routes
app.use('/api', require('./Routers/authRoutes'));
app.use('/api', require('./Routers/recipeRoutes'));
app.use('/api', require('./Routers/preferenceRoutes'));
app.use('/api', require('./Routers/weeklyPlanRoutes'));
app.use('/api', require('./Routers/notificationRoutes'));
app.use('/api', require('./Routers/favoriteRoutes')); // <-- Add this line
app.use('/api', reviewRoutes);

// Test Database Connection
sequelize.authenticate()
    .then(() => {
        console.log('Database connection established');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

// Sync Database
sequelize.sync().then(() => {
    console.log('Database synced');
}).catch((err) => {
    console.error('Database sync error:', err);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Start server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Check for pending notifications every minute
setInterval(async () => {
    try {
        console.log('\n=== Checking for Pending Notifications ===');
        await processPendingNotifications();
    } catch (error) {
        console.error('Error in notification check interval:', error);
    }
}, 60000); // Check every minute