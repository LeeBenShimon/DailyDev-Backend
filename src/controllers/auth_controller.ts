/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Request, Response, NextFunction, RequestHandler } from 'express';
import userModel, { IUser } from '../models/user_model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { Document } from 'mongoose';
interface TokenPayload {
    _id: string;
    random: number;
    exp?: number;
}

const generateTokens = (_id: string): { accessToken: string, refreshToken: string } | null => {
    if (!process.env.TOKEN_SECRET) {
        return null;
    }
    
    const random = Math.floor(Math.random() * 1000000);
    const accessToken = jwt.sign(
        { _id, random },
        process.env.TOKEN_SECRET as jwt.Secret,
        { expiresIn: process.env.TOKEN_EXPIRATION || '1h' } as SignOptions
    );

    const refreshToken = jwt.sign(
        { _id, random },
        process.env.TOKEN_SECRET as jwt.Secret,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d' } as SignOptions
    );

    return { accessToken, refreshToken };
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); // Use the CLIENT_ID from environment variables

const googleSignIn: RequestHandler = async (req, res) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: req.body.credential, // Ensure the client sends the ID token as 'credential'
            audience: process.env.GOOGLE_CLIENT_ID, // Use the CLIENT_ID from environment variables
        });
        const payload = ticket.getPayload();
        const email = payload?.email;
        const username = payload?.name; // Use the name as the username
        // const imgUrl = payload?.picture; // Get the profile picture URL

        if (email != null) {
            let user = await userModel.findOne({ email });
            if (user == null) {
                user = await userModel.create({
                    email,
                    password: '',
                    username, // Include username
                    // imgUrl, // Include imgUrl
                    refreshTokens: []
                });
            }

            const tokens = generateTokens(user._id.toString());
            if (!tokens) {
                res.status(500).send("Failed to generate tokens");
                return;
            }

            res.status(200).send({
                email: user.email,
                _id: user._id,
                username: user.username, // Include username in response
                // imgUrl: user.imgUrl, // Include imgUrl in response
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            });
        } else {
            res.status(400).send("Invalid token");
        }
    } catch (err) {
        res.status(400).send("Invalid token");
    }
};

const register: RequestHandler = async (req, res) => {
    const { email, password, username } = req.body; // Include username
    if (!email || !password || !username) { // Check for username
        res.status(400).send("Missing email, password, or username");
        return;
    }
    try {
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            res.status(400).send("Email already exists");
            return;
        }

        const existingUsername = await userModel.findOne({ username }); // Check for existing username
        if (existingUsername) {
            res.status(400).send("Username already exists");
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await userModel.create({
            email,
            password: hashedPassword,
            username, // Include username
            refreshTokens: []
        });
        res.status(201).send(
            { 
                _id: user._id,
                email: user.email,
                username: user.username // Include username in response
            });
    } catch (err) {
        res.status(400).send(err);
    }
};

const login: RequestHandler = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).send("Missing email or password");
        return;
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            res.status(401).send("Invalid email or password");
            return;
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            res.status(401).send("Invalid email or password");
            return;
        }

        const tokens = generateTokens(user._id.toString());
        if (!tokens) {
            res.status(500).send("Failed to generate tokens");
            return;
        }

        // Store only the new refresh token
        user.refreshTokens = [tokens.refreshToken];
        await user.save();

        res.status(200).send({
            _id: user._id,
            email: user.email,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    } catch (err) {
        res.status(500).send("Internal server error");
    }
};

const logout: RequestHandler = async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).send("Missing token");
        return;
    }

    const token = authHeader.split(' ')[1];
    if (!process.env.TOKEN_SECRET) {
        res.status(500).send("Server configuration error");
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET) as TokenPayload;
        const user = await userModel.findById(decoded._id);
        
        if (!user) {
            res.status(404).send("User not found");
            return;
        }

        // Clear all refresh tokens to force logout from all sessions
        user.refreshTokens = [];
        await user.save();

        res.status(200).send("Logged out successfully");
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            res.status(401).send("Token expired");
        } else {
            res.status(401).send("Invalid token");
        }
    }
};

const refresh: RequestHandler = async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).send("Missing token");
        return;
    }

    const token = authHeader.split(' ')[1];
    if (!process.env.TOKEN_SECRET) {
        res.status(500).send("Server configuration error");
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET) as TokenPayload;
        const user = await userModel.findById(decoded._id);

        if (!user) {
            res.status(404).send("User not found");
            return;
        }

        // Check if the refresh token exists and hasn't been used
        if (!user.refreshTokens.includes(token)) {
            // Security breach - token reuse attempt
            // Clear all refresh tokens to force logout from all sessions
            user.refreshTokens = [];
            await user.save();
            
            res.status(401).send({
                error: "security_breach",
                message: "Token reuse detected. All sessions have been invalidated for security."
            });
            return;
        }

        // Generate new tokens
        const newTokens = generateTokens(user._id.toString());
        if (!newTokens) {
            res.status(500).send("Failed to generate tokens");
            return;
        }

        // Remove the used refresh token and add the new one
        user.refreshTokens = user.refreshTokens.filter(t => t !== token);
        user.refreshTokens.push(newTokens.refreshToken);
        await user.save();

        res.status(200).send({
            accessToken: newTokens.accessToken,
            refreshToken: newTokens.refreshToken
        });
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            res.status(401).send("Refresh token expired");
        } else {
            res.status(401).send("Invalid refresh token");
        }
    }
};

export const authMiddleware: RequestHandler = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).send("Missing token");
        return;
    }

    const token = authHeader.split(' ')[1];
    if (!process.env.TOKEN_SECRET) {
        res.status(500).send("Server configuration error");
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET) as TokenPayload;
        const user = await userModel.findById(decoded._id);

        if (!user) {
            res.status(404).send("User not found");
            return;
        }

        // Check if user is logged out (no refresh tokens)
        if (user.refreshTokens.length === 0) {
            res.status(401).send({
                error: "logged_out",
                message: "User is logged out. Please login again."
            });
            return;
        }

        // Verify this access token belongs to an active session
        const hasValidSession = user.refreshTokens.some(refreshToken => {
            try {
                const decodedRefresh = jwt.verify(refreshToken, process.env.TOKEN_SECRET!) as TokenPayload;
                return decodedRefresh.random === decoded.random;
            } catch {
                return false;
            }
        });

        if (!hasValidSession) {
            res.status(401).send({
                error: "invalid_session",
                message: "Invalid or expired session. Please login again."
            });
            return;
        }

        // Add user ID to request for use in protected routes
        req.query.userId = decoded._id;
        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            res.status(401).send({
                error: "token_expired",
                message: "Access token expired. Please refresh your token."
            });
        } else {
            res.status(401).send({
                error: "invalid_token",
                message: "Invalid token"
            });
        }
    }
};

export default { googleSignIn, register, login, logout, refresh };