# MongoDB Connection Setup

This file (`db.js`) is responsible for establishing a connection to a MongoDB database using **Mongoose** in a Node.js application.

## 📁 File Location

`backend/config/db.js`

## 📌 Purpose

This module:
- Connects to MongoDB using the connection string stored in the environment variable `MONGO_URI`.
- Logs a success message on successful connection.
- Logs the error and exits the process if the connection fails.

## 🧠 How It Works

```js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log("MongoDB connected");
    } catch (err) {
        console.error("Error connecting to MongoDB", err);
        process.exit(1);
    }
};

module.exports = connectDB;
```