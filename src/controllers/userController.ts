import {
  signupUser,
  loginUser,
  UserSignupData,
  getUserByEmail,
  updateUserInfo,
  deleteUser,
} from "../services/userService";
import { Request, Response } from "express";

export async function registerUser(req: Request, res: Response) {
  try {
    const result = await signupUser(req.body as UserSignupData);
    res.status(200).json({
      message: "User successfully created",
      token: result.token,
      user: result,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (
        err.message === "Invalid request body" ||
        err.message === "User already exists"
      ) {
        res.status(400).json({ message: err.message });
      } else {
        console.error(err);
        res
          .status(500)
          .json({ message: "Internal server error", error: err.message });
      }
    } else {
      console.error("Unexpected error type:", err);
      res
        .status(500)
        .json({ message: "Internal server error", error: "Unexpected error" });
    }
  }
}

export async function login(req: Request, res: Response) {
  try {
    const user = await loginUser(req.body);
    res.json(user);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(401).json({ error: err.message });
    }
  }
}

export async function getUser(req: Request, res: Response) {
  try {
    const user = await getUserByEmail(req.params.email);
    res.json(user);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(404).json({ error: err.message });
    }
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const user = await updateUserInfo(req.body, req.params.email);
    res.json(user);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).json({ error: err.message });
    }
  }
}

export async function deleteUserInfo(req: Request, res: Response) {
  try {
    await deleteUser(req.params.email);
    res.json({ message: "User deleted successfully" });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(404).json({ error: err.message });
    }
  }
}
