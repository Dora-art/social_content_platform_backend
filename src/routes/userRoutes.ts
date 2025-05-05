import express from "express";
import { UserController } from "../controllers/userController";
const router = express.Router();
const userController = new UserController();
router.post("/register", userController.registerUser);
router.post("/login", userController.login);
router.get("/user", userController.getAllUsers);
router.get("/user/:id", userController.getUser);
router.put("/user/:id", userController.updateUser);
router.delete("/user/:id", userController.deleteUser);

export default router;
