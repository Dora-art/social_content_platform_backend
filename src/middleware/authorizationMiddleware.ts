import {Request, Response, NextFunction } from "express";
import { AuthenticationError, ForbiddenError} from "../utils/error";

export enum UserRole {
ADMIN = "admin",
EDITOR = "editor",
USER = "user",
GUEST = "guest"
}

export const requireSelf = (req: Request, res:Response, next: NextFunction) => {
    if(!req.user){
        return next(new AuthenticationError("Authentication required"))
    }
    const requestingUserId = req.user.id
    const userId = req.params.userId

      if (!requestingUserId) {
        return next(new AuthenticationError("User ID not found in token"))
    }
    
    if (!userId) {
        return next()
    }
    if(requestingUserId.toString() ===  userId.toString() ){
        return next()
    }
    return next(new ForbiddenError("Access denied"))
}


export const requireEditorOrAdmin = (req: Request, res:Response, next: NextFunction )=>{

   if(!req.user){
    return next(new AuthenticationError("Authentication required"))
   }
   const user = req.user
   if(!(user.role === UserRole.ADMIN || UserRole.EDITOR)){
    return next(new ForbiddenError("Access denied"))
}
next()
}

export const requireSelfOrEditorOrAdmin = (req: Request, res: Response, next: NextFunction)=>{
if(!req.user){
    return next(new AuthenticationError("Authentication required"))
}
   const user = req.user
    const requestingUserId = req.user.id
const UserId = req.params.id

if((user.role === UserRole.ADMIN ||UserRole.EDITOR) || requestingUserId=== UserId ){
    return next()
}
    return next(new ForbiddenError("Access denied"))


}

export const requireSelfOrAdmin =(req:Request, res: Response, next: NextFunction)=>{
if(!req.user){
    return next(new AuthenticationError("Authentication required"))
}

const user = req.user
const requestingUserId = req.user.id
const UserId = req.params.id

if(user.role === UserRole.ADMIN || requestingUserId=== UserId ){
    return next()
}
return next(new ForbiddenError("Access denied"))
    }


export const requireAdmin = (req: Request, res: Response, next: NextFunction)=> {
if(!req.user){
    return next(new AuthenticationError("Authentication required"))
}

const user = req.user

if(!(user.role === UserRole.ADMIN)){
    return next(new ForbiddenError("Admin access denied"))
}
next()
}

export const requireEditor = (req: Request, res: Response, next: NextFunction) => {
if(!req.user){
    return next(new AuthenticationError("Authentication required"))
}

const user = req.user

if(!(user.role === UserRole.ADMIN)){
    return next(new ForbiddenError("Editor access denied"))
}
next()
}