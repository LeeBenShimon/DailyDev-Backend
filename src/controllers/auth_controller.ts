/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Request, Response, NextFunction} from 'express';
import userModel from '../models/user_model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
const register = async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;
    if(!email || !password){
        res.status(400).send("missing Email or password");
        return;
    }
    try{
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await userModel.create({
            email: email,
            password: hashedPassword,
        });
        res.status(200).send(user);
    }catch(err){
        res.status(400).send(err);
    }
};   

const generateTokens = (_id: string): { accessToken: string, refreshToken: string } | null => {
    const random = Math.floor(Math.random() * 1000000);
    if (!process.env.TOKEN_SECRET) {
        return null;
    }
    const accessToken = jwt.sign(
        {
            _id: _id,
            random: random
        },
        process.env.TOKEN_SECRET as jwt.Secret,
        { expiresIn: process.env.TOKEN_EXPIRATION } as SignOptions
    );

    const refreshToken = jwt.sign(
        {
            _id: _id,
            random: random
        },
        process.env.TOKEN_SECRET as jwt.Secret,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION } as SignOptions);

    return { accessToken, refreshToken };
};
const login = async (req: Request, res: Response) => {
    const email = req.body.email;
    const password = req.body.password;
    if(!email || !password){
        res.status(400).send("wrong Email or password");
        return;
    }
    try{
        const user = await userModel.findOne({ email: email });
        if(!user){
            res.status(404).send("wrong Email or password");
            return;
        }       
        const validPassword = await bcrypt.compare(password, user.password);
        if(!validPassword){
            res.status(400).send("wrong Email or password");
            return;
        }

        const userId: string = user._id.toString();
        const tokens = generateTokens(userId);
        if(!tokens){
            res.status(400).send("missing auth configuration");
            return;
        }

        if(user.refreshTokens == null){
            user.refreshTokens = "";
        }
        user.refreshTokens=tokens.refreshToken;
        await user.save();

        res.status(200).send({ 
            email: user.email,
            _id: user._id, 
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
        });
    }catch(err){
        res.status(400).send(err);
    }
};

const logout = async (req: Request, res: Response) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        res.status(401).send("missing token");
        return;
    }
    //first validate the refresh token
    if(!process.env.TOKEN_SECRET){
        res.status(400).send("missing auth configuration");
        return;
    }
    jwt.verify(token, process.env.TOKEN_SECRET, async (err: any, data: any) => {
        if(err){
            res.status(403).send("invalid token");
            return;
        }
        const payload = data as TokenPayload;
        try{
            const user = await userModel.findOne({ _id: payload._id });
            if(!user){
                res.status(400).send("invalid token");
                return;
            }
            if(!user.refreshTokens || user.refreshTokens != token){
                res.status(400).send("invalid token");
                user.refreshTokens = "";
                await user.save();
                return;
            }
            user.refreshTokens = "";
            await user.save();
            res.status(200).send("logged out");
        } catch(err){
            res.status(400).send("invalid token");
        }
    });
};

const refresh = async (req: Request, res: Response) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        res.status(401).send("missing token");
        return;
    }
    if(!process.env.TOKEN_SECRET){
        res.status(400).send("missing auth configuration");
        return;
    }
    jwt.verify(token, process.env.TOKEN_SECRET, async (err: any, data: any) => {
        if(err){
            res.status(403).send("invalid token");
            return;
        }
        const payload = data as TokenPayload;
        try{
            const user = await userModel.findOne({ _id: payload._id });
            if(!user){
                res.status(400).send("invalid token");
                return;
            }

            if(!user.refreshTokens || user.refreshTokens != token){
                user.refreshTokens = "";
                await user.save();
                res.status(400).send("invalid token");
                return;
            }

            const newTokens = generateTokens(user._id.toString());
            if(!newTokens){
                user.refreshTokens = "";
                await user.save();
                res.status(400).send("missing auth configuration");
                return;
            }

            user.refreshTokens = newTokens.refreshToken;
            await user.save();

            res.status(200).send({ 
                accessToken: newTokens.accessToken,
                refreshToken: newTokens.refreshToken 
            });
        } catch(err){
            res.status(400).send("invalid token");
        }
    });
};

type TokenPayload = {
    _id: string
};
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(!token){
        res.status(401).send("missing token");
        return;
    }
    if(!process.env.TOKEN_SECRET){
        res.status(400).send("missing auth configuration");
        return;
    }
    jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
        if(err){
            res.status(403).send("invalid token");
            return;
        }
        const payload = data as TokenPayload;
        req.query.userId = payload!._id;
        next();
    });
};


export default { register, login, logout, refresh };