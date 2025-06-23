import express from "express";
import { UserController } from "../controllers/userController";
import { authenticate } from "../middleware/auth/authenticationMiddleware";
import { requireAdmin, requireSelfOrAdmin } from "../middleware/authorizationMiddleware";
const router = express.Router();
const userController = new UserController();
router.post("/register", userController.registerUser);
router.post("/login", userController.login);
router.get("/users",authenticate,requireAdmin, userController.getAllUsers);
router.get("/user/:id",authenticate,requireSelfOrAdmin, userController.getUser);
router.put("/user/:id",authenticate, requireSelfOrAdmin,userController.updateUser);
router.delete("/user/:id",authenticate,requireSelfOrAdmin,userController.deleteUser);

export default router;
