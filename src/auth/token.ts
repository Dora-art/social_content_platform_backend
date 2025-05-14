import { JwtPayload } from "jsonwebtoken";

export interface TokenPayload extends JwtPayload{

    userId:string,
    username?: string,
    email?: string;
    role?: string
   }