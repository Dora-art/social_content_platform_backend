import { NextFunction, Request, Response } from "express";
import { CategoryService } from "../services/categoryService";
import mongoose from "mongoose";
import { BadRequestError } from "../utils/error";
import { Category } from "../models/Category";

const categoryService = new CategoryService();

export class CategoryController {
  async createCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      
      const { name, desc } = req.body;
      
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return next(
          new BadRequestError("Category with this name already exists")
        );
      }
      const category = await categoryService.createCategory(name, desc);
      res.status(201).json(category);
    } catch (err) {
      next(err);
    }
  }

  async getCategory(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new BadRequestError("Invalid Category ID format"));
      }
      const category = await categoryService.getCategoryById(id);
      res.status(200).json(category);
    } catch (err) {
      next(err);
    }
  }

  async getAllCategories(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const categories = await categoryService.getAllCategories();
      res.status(200).json(categories);
    } catch (err) {
      next(err);
    }
  }
}
