const express = require('express');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getUsers, getUserById, deleteUser } = require('../controllers/userController');

const router = express.Router();

// User Management Routes
router.get("/", protect, getUsers); // Get all users (add adminOnly for Admin only)
router.get("/:id", protect, getUserById); // Get a specific user

module.exports = router;