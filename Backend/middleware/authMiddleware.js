const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(404).json({ message: 'User not found' });
            }
            console.log('Authenticated User:', req.user);
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

//Middleware for Admin-only access
const adminOnly = (req, res, next) => {
    console.log('Admin Check:', req.user);
    if (req.user && req.user.role === 'admin') {
        next(); // Proceed to the next middleware or route handler
    } else {
        res.status(403).json({ message: 'Access denied, admin only' }); // Not an admin
    }
};

module.exports = { protect, adminOnly };