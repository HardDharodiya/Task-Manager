require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");

// Assuming models are User and Task. We need to check their locations.
const User = require("./models/User");

const updateUrls = async () => {
    try {
        await connectDB();
        
        console.log("Checking for users with localhost image URLs...");
        
        const usersToUpdate = await User.find({
            profileImageUrl: { $regex: 'http://localhost:8000' }
        });
        
        console.log(`Found ${usersToUpdate.length} users to update.`);
        
        let count = 0;
        for (const user of usersToUpdate) {
            user.profileImageUrl = user.profileImageUrl.replace(
                "http://localhost:8000", 
                "https://task-manager-44nm.onrender.com"
            );
            await user.save();
            count++;
        }
        
        console.log(`Successfully updated ${count} user profiles.`);
        
        process.exit(0);
    } catch (error) {
        console.error("Error updating URLs:", error);
        process.exit(1);
    }
};

updateUrls();
