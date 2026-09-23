import type { Request, Response } from "express";
import { prisma } from "../prisma.js";

export async function listCategories(_req: Request, res: Response) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  res.json(categories);
}

export async function createCategory(req: Request, res: Response) {
  const { name } = req.body;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "O campo 'name' é obrigatório." });
  }
  const category = await prisma.category.create({ data: { name } });
  res.status(201).json(category);
}

export async function updateCategory(req: Request, res: Response) {
  const { id } = req.params;
  const { name } = req.body;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "O campo 'name' é obrigatório." });
  }
  const category = await prisma.category.update({ where: { id }, data: { name } });
  res.json(category);
}

export async function deleteCategory(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.category.delete({ where: { id } });
  res.status(204).send();
}
