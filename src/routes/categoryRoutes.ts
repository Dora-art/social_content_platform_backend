import express from "express";
import { CategoryController } from "../controllers/categoryController";
import { requireAdmin } from "../middleware/authorizationMiddleware";
import { authenticate } from "../middleware/auth/authenticationMiddleware";

const router = express.Router();

const categoryController = new CategoryController();

router.post(
  "/create",
  authenticate,
  requireAdmin,
  categoryController.createCategory
);
router.get(
  "/category/:id",
  authenticate,
  requireAdmin,
  categoryController.getCategory
);
router.get(
  "/categories",
  authenticate,
  requireAdmin,
  categoryController.getAllCategories
);

export default router;
