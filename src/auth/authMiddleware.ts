import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import {AuthenticationError} from "../utils/error"
import { TokenPayload } from "./token"; 
import User, { UserDocument } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET

export const authenticate = (req: Request, res: Response, next: NextFunction)=>{
const authHeader = req.headers.authorization
if(!authHeader || !authHeader.startsWith("Bearer")){
    return next(new AuthenticationError("Authentication token missing"))
}
    const token = authHeader.split(" ")[1]

    try{
        const decoded = jwt.verify(token, JWT_SECRET as string) as TokenPayload;
        User.findById(decoded.userId).then((user: UserDocument | null) => {
            if(!user){
                return next(new AuthenticationError("Invalid user"))
            }
            req.user = user;
            req.tokenPayload = decoded;
            next()
        })
        
    }catch(err){
       return next(new AuthenticationError(`Token verification failed ${err instanceof Error ? err.message: String(err)}`))
    }
}