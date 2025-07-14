const jwt = require('jsonwebtoken');
const { User } = require('../Models');

const auth = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await User.findByPk(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (err) {
        console.error('Auth middleware error:', err);
        res.status(401).json({ error: 'Authentication required' });
    }
};

module.exports = auth;
