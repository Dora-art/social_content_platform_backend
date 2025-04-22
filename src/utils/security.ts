import {UserDocument} from "../models/User"

export function sanitizeFields(user: UserDocument): Partial<UserDocument> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password,token, ...sanitizedUser } = user; 
    return sanitizedUser;
}