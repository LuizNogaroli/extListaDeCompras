import type { Request, Response } from "express";
import { prisma } from "../prisma.js";

const productInclude = {
  category: true,
  suppliers: true,
} as const;

export async function listProducts(_req: Request, res: Response) {
  const products = await prisma.product.findMany({
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
  res.json(products);
}

export async function createProduct(req: Request, res: Response) {
  const { name, description, estimatedPrice, categoryId, suppliers } = req.body;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "O campo 'name' é obrigatório." });
  }

  const product = await prisma.product.create({
    data: {
      name,
      description: description ?? null,
      estimatedPrice: estimatedPrice ?? null,
      categoryId: categoryId ?? null,
      suppliers: {
        create: Array.isArray(suppliers)
          ? suppliers.map((s: { name: string; url?: string; price?: number; notes?: string }) => ({
              name: s.name,
              url: s.url ?? null,
              price: s.price ?? null,
              notes: s.notes ?? null,
            }))
          : [],
      },
    },
    include: productInclude,
  });
  res.status(201).json(product);
}

export async function updateProduct(req: Request, res: Response) {
  const { id } = req.params;
  const { name, description, estimatedPrice, categoryId, purchased, suppliers } = req.body;

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(estimatedPrice !== undefined && { estimatedPrice }),
      ...(categoryId !== undefined && { categoryId }),
      ...(purchased !== undefined && { purchased }),
      // O formulário de edição sempre reenvia a lista completa de fornecedores (sem ids,
      // já que o form só trabalha com nome/url/preço/notas) — por isso substituímos tudo
      // em vez de tentar casar registros existentes.
      ...(Array.isArray(suppliers) && {
        suppliers: {
          deleteMany: {},
          create: suppliers.map((s: { name: string; url?: string; price?: number; notes?: string }) => ({
            name: s.name,
            url: s.url ?? null,
            price: s.price ?? null,
            notes: s.notes ?? null,
          })),
        },
      }),
    },
    include: productInclude,
  });
  res.json(product);
}

export async function deleteProduct(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.product.delete({ where: { id } });
  res.status(204).send();
}

export async function createSupplier(req: Request, res: Response) {
  const { id: productId } = req.params;
  const { name, url, price, notes } = req.body;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "O campo 'name' é obrigatório." });
  }

  const supplier = await prisma.supplier.create({
    data: { productId, name, url: url ?? null, price: price ?? null, notes: notes ?? null },
  });
  res.status(201).json(supplier);
}

export async function updateSupplier(req: Request, res: Response) {
  const { supplierId } = req.params;
  const { name, url, price, notes } = req.body;

  const supplier = await prisma.supplier.update({
    where: { id: supplierId },
    data: {
      ...(name !== undefined && { name }),
      ...(url !== undefined && { url }),
      ...(price !== undefined && { price }),
      ...(notes !== undefined && { notes }),
    },
  });
  res.json(supplier);
}

export async function deleteSupplier(req: Request, res: Response) {
  const { supplierId } = req.params;
  await prisma.supplier.delete({ where: { id: supplierId } });
  res.status(204).send();
}
