import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/userService";
import {
  UserSignupData,
  UserLoginData,
  updateUserData,
} from "../services/userService";

const userService = new UserService();

export class UserController {
  async registerUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.signupUser(req.body as UserSignupData);
      res.status(200).json({
        message: "User successfully created",
        token: result.token,
        user: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.loginUser(req.body as UserLoginData);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
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
      const result = await userService.deleteUser(req.params.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

const userController = new UserController();
export { userController };
