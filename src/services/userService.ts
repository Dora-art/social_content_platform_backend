import User, { UserDocument } from "../models/User";
import logger from "../config/logger";
import { generateToken } from "../middleware/auth/jwt";
import { hashPassword, matchPassword } from "../utils/password";
import { sanitizeFields } from "../utils/security";
import { z } from "zod";
import { BadRequestError, NotFoundError } from "../utils/error";
import { UserRole } from "../middleware/authorizationMiddleware";

export interface UserSignupData {
  username: string;
  password: string;
  email: string;
  role?: UserRole;
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
  role: z.nativeEnum(UserRole).optional(),
});

const updateSchema = z.object({
  username: z.string().trim().min(1).optional(),
  password: z.string().trim().min(6).optional(),
});

export class UserService {
  async signupUser(data: UserSignupData): Promise<{user:Partial<UserDocument>, token: string}> {
    const parsedBody = bodySchema.safeParse(data);
    if (!parsedBody.success) {
      throw new BadRequestError(
        "Invalid request body: " + parsedBody.error.message
      );
    }
    const body = parsedBody.data;
    const { username, email, password, role } = body;

    const existing = await User.findOne({ email });
    if (existing) {
      throw new BadRequestError("User with this email already exists");
    }

    const hashedPassword = await hashPassword(password);
    //instance of the user model
    const user = new User({
      username: username,
      email: email,
      password: hashedPassword,
      role: role || UserRole.USER,
      blogs: [],
    });

    const savedUser = await user.save();

    const token = generateToken({ userId: savedUser._id.toString(), username: user.username,
      email: user.email,
      role: user.role });
    
    return {
      user: sanitizeFields(savedUser.toObject()),
      token: token
    }
  }

  async loginUser(
    data: UserLoginData
  ): Promise<{ user: Partial<UserDocument>; token: string }> {
    if (!data.email) throw new BadRequestError("Email must be provided");
    if (!data.password) throw new BadRequestError("Password must be provided");

    const user = await User.findOne({ email: data.email });
    if (!user) {
      throw new BadRequestError("Invalid credentials");
    }

    const match = await matchPassword(data.password, user.password);
    if (!match) throw new BadRequestError("Invalid credentials");

    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role
    });

    return {
      user: sanitizeFields(user.toObject()),
      token: token,
    };
  }

  async getUser(id: string): Promise<Partial<UserDocument>> {
    const user = await User.findById(id);
    if (!user) throw new NotFoundError("User does not exist");

    return sanitizeFields(user.toObject());
  }

  async getAllUsers(): Promise<Partial<UserDocument>[]> {
    try {
      const users = await User.find({});
      return users.map((user) => sanitizeFields(user.toObject()));
    } catch (error: unknown) {
      logger.error("Error in getAllUsersService: ", {
        originalErrorDetails: error,
        serviceMethod: "getAllUsers",
      });
      throw error;
    }
  }

  async updateUserInfo(
    id: string,
    data: Partial<updateUserData>
  ): Promise<Partial<UserDocument>> {
    const parsedData = updateSchema.safeParse(data);
    if (!parsedData.success) {
      throw new BadRequestError(
        "Invalid update data: " + parsedData.error.message
      );
    }

    const updateFields = parsedData.data;
    const user = await User.findById(id);
    if (!user) throw new NotFoundError("No user found");

    if (updateFields.username) {
      user.username = updateFields.username;
    }

    if (updateFields.password) {
      try {
        user.password = await hashPassword(updateFields.password);
      } catch (error: unknown) {
        logger.error("Password hashing failed during user update:", {
          originalErrorDetails: error,
          operation: "hashPassword",
        });
        throw error;
      }
    }
    const updatedUser = await user.save();
    return sanitizeFields(updatedUser.toObject());
  }

  async deleteUser(id: string): Promise<DeleteUserResponse> {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return { message: "User successfully deleted" };
  }
}
