import { Router } from "express";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../controllers/products.controller.js";

export const productsRouter = Router();

productsRouter.get("/", listProducts);
productsRouter.post("/", createProduct);
productsRouter.put("/:id", updateProduct);
productsRouter.delete("/:id", deleteProduct);

productsRouter.post("/:id/suppliers", createSupplier);
productsRouter.put("/:id/suppliers/:supplierId", updateSupplier);
productsRouter.delete("/:id/suppliers/:supplierId", deleteSupplier);
