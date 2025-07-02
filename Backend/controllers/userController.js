const Task = require('../models/Task');
const User = require('../models/User');
const bcrypt = require('bcryptjs');


//@desc   Get all users (Admin only)
//@route  GET /api/users/
//@access Private (Admin role)
const getUsers = async (req, res) => {
    try {
        const user = await User.find().select("-password");

        //Add task counts to each user
        const userWithTaskCounts = await Promise.all(
            user.map(async (user) => {
                const pendingTask = await Task.countDocuments({
                    assignedTo: user._id, status: "Pending"
                });
                const inProgressTask = await Task.countDocuments({
                    assignedTo: user._id, status: "In Progress"
                });
                const completedTask = await Task.countDocuments({
                    assignedTo: user._id, status: "completed"
                });

                return {
                    ...user._doc,// Include all existing user data
                    pendingTask,
                    inProgressTask,
                    completedTask,
                };
            }));

        res.json(userWithTaskCounts);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//@desc   Get user by id
//@route  GET /api/users/:id
//@access Private (Requires JWT)
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



module.exports = {
    getUsers,
    getUserById,
};