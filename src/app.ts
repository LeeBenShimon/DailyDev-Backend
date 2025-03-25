// Lee-Ben-Shimon-322978909
// noa-aharon-207131400

import dotenv from 'dotenv';
dotenv.config(); 

import express from 'express';
import initApp from "./server";

const port = process.env.PORT || 3000; 
const app = express();


app.use(express.static('public'));


initApp().catch((error) => {
    console.error("Failed to initialize app:", error);
});