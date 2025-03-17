// import { Request, Response, NextFunction } from 'express';
// import { OAuth2Client } from 'google-auth-library';
// import userModel from '../models/user_model';
// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';

// dotenv.config();

// const client = new OAuth2Client(
//     process.env.GOOGLE_CLIENT_ID,
//     process.env.GOOGLE_CLIENT_SECRET,
//     'postmessage'  // This is for handling the OAuth flow in the frontend
// );

// interface GoogleUserInfo {
//     sub: string;        // Google's unique identifier
//     email: string;
//     name: string;
//     picture: string;
// }

// const generateTokens = (_id: string): { accessToken: string, refreshToken: string } | null => {
//     if (!process.env.TOKEN_SECRET) {
//         return null;
//     }
    
//     const random = Math.floor(Math.random() * 1000000);
//     const accessToken = jwt.sign(
//         { _id, random },
//         process.env.TOKEN_SECRET as jwt.Secret,
//         { expiresIn: process.env.TOKEN_EXPIRATION || '1h' }
//     );

//     const refreshToken = jwt.sign(
//         { _id, random },
//         process.env.TOKEN_SECRET as jwt.Secret,
//         { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d' }
//     );

//     return { accessToken, refreshToken };
// };

// export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const { token } = req.body;  // This is the ID token from Google

//         if (!token) {
//             return res.status(400).json({ error: 'Token is required' });
//         }

//         // Verify the token with Google
//         const ticket = await client.verifyIdToken({
//             idToken: token,
//             audience: process.env.GOOGLE_CLIENT_ID
//         });

//         const payload = ticket.getPayload() as GoogleUserInfo;
//         if (!payload) {
//             return res.status(400).json({ error: 'Invalid token' });
//         }

//         // Check if user exists
//         let user = await userModel.findOne({ 
//             $or: [
//                 { googleId: payload.sub },
//                 { email: payload.email }
//             ]
//         });

//         if (user) {
//             // If user exists but doesn't have googleId (registered with email/password)
//             if (!user.googleId) {
//                 return res.status(400).json({ 
//                     error: 'Email already registered with password' 
//                 });
//             }
//         } else {
//             // Create new user
//             user = await userModel.create({
//                 email: payload.email,
//                 googleId: payload.sub,
//                 displayName: payload.name,
//                 picture: payload.picture,
//                 provider: 'google',
//                 refreshTokens: []
//             });
//         }

//         // Generate tokens
//         const tokens = generateTokens(user._id.toString());
//         if (!tokens) {
//             return res.status(500).json({ error: 'Failed to generate tokens' });
//         }

//         // Update refresh tokens
//         user.refreshTokens = [tokens.refreshToken];
//         await user.save();

//         // Set refresh token in httpOnly cookie
//         res.cookie('refreshToken', tokens.refreshToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: 'strict',
//             maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
//         });

//         // Send response
//         res.status(200).json({
//             user: {
//                 _id: user._id,
//                 email: user.email,
//                 displayName: user.displayName,
//                 picture: user.picture,
//                 provider: user.provider
//             },
//             accessToken: tokens.accessToken
//         });

//     } catch (error) {
//         console.error('Google auth error:', error);
//         res.status(500).json({ error: 'Authentication failed' });
//     }
// };

// export default { googleAuth }; 