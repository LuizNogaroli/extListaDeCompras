import type { Category, Product, ProductInput } from "../types";

const BASE_URL = "http://localhost:3333";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Erro ${res.status} ao chamar ${path}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  categories: {
    list: () => request<Category[]>("/categories"),
    create: (name: string) =>
      request<Category>("/categories", { method: "POST", body: JSON.stringify({ name }) }),
    rename: (id: string, name: string) =>
      request<Category>(`/categories/${id}`, { method: "PUT", body: JSON.stringify({ name }) }),
    remove: (id: string) => request<void>(`/categories/${id}`, { method: "DELETE" }),
  },
  products: {
    list: () => request<Product[]>("/products"),
    create: (input: ProductInput) =>
      request<Product>("/products", { method: "POST", body: JSON.stringify(input) }),
    update: (id: string, input: Partial<ProductInput> & { purchased?: boolean }) =>
      request<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(input) }),
    remove: (id: string) => request<void>(`/products/${id}`, { method: "DELETE" }),
  },
};
