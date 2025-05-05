import mongoose from 'mongoose';
import User, { UserDocument } from "../models/User"; // Your Mongoose User model
import { generateToken } from "../utils/jwt";
import { hashPassword, matchPassword } from "../utils/password";
import { sanitizeFields } from "../utils/security";
import { z } from "zod";
import { BadRequestError } from '../utils/error';

export interface UserSignupData {
    username: string; 
    password: string;
    email: string;
}

export interface UserLoginData {
    email: string;
    password: string;
}

export interface updateUserData {
    username?: string;
    password?: string;
}

interface DeleteUserResponse {
    message: string;
}

const bodySchema = z.object({
    username: z.string().trim().min(1),
    email: z.string().trim().email(),
    password: z.string().trim().min(6),
});

const updateSchema = z.object({
    username: z.string().trim().min(1).optional(),
    password: z.string().trim().min(6).optional(),
});

export class UserService {
    async signupUser(data: UserSignupData): Promise<Partial<UserDocument>> {
        const parsedBody = bodySchema.safeParse(data);
        if (!parsedBody.success) {
            throw new BadRequestError("Invalid request body: " + parsedBody.error.message);
        }
        const body = parsedBody.data;
        const { username, email, password } = body;

        const existing = await User.findOne({ email });
        if (existing) {
            throw new Error("User already exists");
        }

        const hashedPassword = await hashPassword(password);
        //instance of the user model
        const user = new User({
            username: username,
            email: email,
            password: hashedPassword,
            blogs: [],
        });

        const savedUser = await user.save();
        const plainUser = savedUser.toObject();
        const token = generateToken(plainUser);
        savedUser.token = token;
        await savedUser.save();

        return sanitizeFields(savedUser.toObject());
    }

    async loginUser(data: UserLoginData): Promise<Partial<UserDocument>> {
        if (!data.email) throw new Error("Email must be provided");
        if (!data.password) throw new Error("Password must be provided");

        const user = await User.findOne({ email: data.email });
        if (!user) {
            throw new Error("User does not exist");
        }

        const match = await matchPassword(data.password, user.password);
        if (!match) throw new Error("Wrong password entered");

        user.token = generateToken(user.toObject());
        await user.save();
        return sanitizeFields(user.toObject());
    }

    async getUser(id: string): Promise<Partial<UserDocument>> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid User ID");
        }
        const user = await User.findById(id);
        if (!user) throw new Error("User does not exist");

        return sanitizeFields(user.toObject());
    }

    async getAllUsers(): Promise<Partial<UserDocument>[]> {
        try {
            const users = await User.find({});
            return users.map(user => sanitizeFields(user.toObject()));
        } catch (error) {
            console.error("Error in getAllUsersService: ", error);
            throw new Error("Failed to retrieve users"); // More generic error
        }
    }

    async updateUserInfo(
        id: string,
        data: Partial<updateUserData>
    ): Promise<Partial<UserDocument>> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error("Invalid User ID");
        }
        const parsedData = updateSchema.safeParse(data);
        if (!parsedData.success) {
            throw new Error("Invalid update data: " + parsedData.error.message);
        }

        const updateFields = parsedData.data;
        const user = await User.findById(id);
        if (!user) throw new Error("No user found");

        if (updateFields.username) {
            user.username = updateFields.username;
        }

        if (updateFields.password) {
            try {
                user.password = await hashPassword(updateFields.password);
            } catch (error) {
                console.error("Password hashing failed:", error);
                throw new Error("Failed to hash password");
            }
        }
        const updatedUser = await user.save();
        return sanitizeFields(updatedUser.toObject());
    }

    async deleteUser(id: string): Promise<DeleteUserResponse> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error("Invalid User ID.");
        }
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            throw new Error("User not found");
        }

        return { message: "User successfully deleted" };
    }
}
