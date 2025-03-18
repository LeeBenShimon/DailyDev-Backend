// Lee-Ben-Shimon-322978909
// Linoy-Eligulashvili-213655590

import dotenv from 'dotenv';
dotenv.config(); // Load environment variables

import express from 'express';
import initApp from "./server";

const port = process.env.PORT || 3000; // ברירת מחדל אם אין PORT מוגדר
const app = express();

// Serve static files from the "public" directory
app.use(express.static('public'));

// Initialize the app with additional configurations
initApp().then((app) => {
    app.listen(port, () => {
        console.log(`🚀 Server running at http://localhost:${port}`);
    });
}).catch((error) => {
    console.error("❌ Failed to initialize app:", error);
});
