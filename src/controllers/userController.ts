import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/userService";
import {
  UserSignupData,
  UserLoginData,
  updateUserData,
} from "../services/userService";
import mongoose from "mongoose";
import { BadRequestError } from "../utils/error";

const userService = new UserService();

export class UserController {
  async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.signupUser(req.body as UserSignupData);
      res.status(201).json({
        message: "User successfully created",
         data: {
          user: result.user,
          token: result.token
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.loginUser(req.body as UserLoginData);
      res.status(200).json({
        success:true,
        message: "Login successful",
        data: {
          user: result.user,
          token: result.token
        }
      })
    } catch (err) {
      next(err);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
       if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            throw new BadRequestError("Invalid User ID");
          }
      const user = await userService.getUser(req.params.id);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAllUsers();
      res.status(200).json(users);
    } catch (err) {
      next(err);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new BadRequestError("Invalid User ID");
    }
      const user = await userService.updateUserInfo(
        req.params.id,
        req.body as updateUserData
      );
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            throw new BadRequestError("Invalid User ID.");
          }
      const result = await userService.deleteUser(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

const userController = new UserController();
export { userController };
