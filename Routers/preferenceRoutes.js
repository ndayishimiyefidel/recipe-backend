const express = require('express');
const router = express.Router();
const Preference = require('../Models/Preference');
const User = require('../Models/User');
const { authenticateToken } = require('../Middleware/auth');

// Function to get all preferences
const getAllPreferences = async (req, res) => {
    try {
        const preferences = await Preference.findAll({
            attributes: ['id', 'name', 'description']
        });
        res.json(preferences);
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
};

// Function to get user's preferences
const getUserPreferences = async (req, res) => {
    try {
        const preferences = await Preference.findAll({
            where: { userId: req.user.id }
        });
        res.json(preferences);
    } catch (error) {
        console.error('Error fetching user preferences:', error);
        res.status(500).json({ error: 'Failed to fetch user preferences' });
    }
};

// Function to add preferences for user (no authentication required)
const addUserPreferences = async (req, res) => {
    try {
        const { preferences, userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Validate preferences array
        if (!preferences || !Array.isArray(preferences) || preferences.length === 0) {
            return res.status(400).json({ error: 'Preferences array is required and must not be empty' });
        }

        // Check for duplicate preferences
        const existingPreferences = await Preference.findAll({
            where: { 
                userId: user.id,
                name: preferences
            }
        });
        console.log('Existing preferences:', existingPreferences);

        if (existingPreferences.length > 0) {
            return res.status(400).json({ error: 'Some preferences already exist for this user' });
        }

        // Create preferences for the user
        const createdPreferences = await Promise.all(
            preferences.map(pref => 
                Preference.create({
                    name: pref,
                    userId: user.id
                })
            )
        );

        res.status(201).json({
            message: 'Preferences added successfully',
            preferences: createdPreferences
        });
    } catch (error) {
        console.error('Error adding preferences:', error);
        res.status(500).json({ error: 'Failed to add preferences' });
    }
};

// Function to update user's preferences
const updateUserPreferences = async (req, res) => {
    try {
        const { preferences } = req.body;
        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Validate preferences array
        if (!preferences || !Array.isArray(preferences)) {
            return res.status(400).json({ error: 'Preferences array is required' });
        }

        // Delete existing preferences
        await Preference.destroy({
            where: { userId: user.id }
        });

        // Create new preferences
        const createdPreferences = await Promise.all(
            preferences.map(pref => 
                Preference.create({
                    name: pref,
                    userId: user.id
                })
            )
        );

        res.json({
            message: 'Preferences updated successfully',
            preferences: createdPreferences
        });
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
};

// Function to delete a preference
const deleteUserPreference = async (req, res) => {
    try {
        const preference = await Preference.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        });

        if (!preference) {
            return res.status(404).json({ error: 'Preference not found' });
        }

        await preference.destroy();
        res.json({ message: 'Preference deleted successfully' });
    } catch (error) {
        console.error('Error deleting preference:', error);
        res.status(500).json({ error: 'Failed to delete preference' });
    }
};

// Routes using the functions
router.get('/preferences', getAllPreferences);
router.get('/user/preferences', authenticateToken, getUserPreferences);
router.post('/preferences', addUserPreferences); // No authentication required
router.put('/preferences', authenticateToken, updateUserPreferences);
router.delete('/preferences/:id', authenticateToken, deleteUserPreference);

module.exports = router; 