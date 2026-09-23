import { Router } from "express";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categories.controller.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", listCategories);
categoriesRouter.post("/", createCategory);
categoriesRouter.put("/:id", updateCategory);
categoriesRouter.delete("/:id", deleteCategory);
