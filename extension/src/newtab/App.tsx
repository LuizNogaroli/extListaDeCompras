import { useEffect, useMemo, useState } from "react";
import { api } from "./api/client";
import type { Category, Product, ProductInput } from "./types";
import { ProductList } from "./components/ProductList";
import { ProductForm } from "./components/ProductForm";
import { CategoryManager } from "./components/CategoryManager";
import "./App.css";

export function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setFormOpen] = useState(false);
  const [isCategoryManagerOpen, setCategoryManagerOpen] = useState(false);

  // Itens recém-criados nesta sessão que ainda estão "sendo pesquisados" (simulação —
  // não existe busca real por marketplaces ainda, ver docs/roadmap.md).
  const [searchingIds, setSearchingIds] = useState<Set<string>>(new Set());

  function markAsSearching(productId: string) {
    setSearchingIds((prev) => new Set(prev).add(productId));
    setTimeout(() => {
      setSearchingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }, 2200);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [cats, prods] = await Promise.all([api.categories.list(), api.products.list()]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} — verifique se o backend está rodando em http://localhost:3333`
          : "Erro ao carregar dados."
      );
    } finally {
      setLoading(false);
    }
  }

  const visibleProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || p.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  function openCreateForm() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function openEditForm(product: Product) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  async function handleFormSubmit(input: ProductInput) {
    if (editingProduct) {
      await api.products.update(editingProduct.id, input);
    } else {
      const created = await api.products.create(input);
      markAsSearching(created.id);
    }
    setFormOpen(false);
    setEditingProduct(null);
    await loadAll();
  }

  async function handleTogglePurchased(product: Product) {
    await api.products.update(product.id, { purchased: !product.purchased });
    await loadAll();
  }

  async function handleDeleteProduct(product: Product) {
    if (!confirm(`Excluir "${product.name}" da lista?`)) return;
    await api.products.remove(product.id);
    await loadAll();
  }

  async function handleCreateCategory(name: string) {
    await api.categories.create(name);
    await loadAll();
  }

  async function handleRenameCategory(id: string, name: string) {
    await api.categories.rename(id, name);
    await loadAll();
  }

  async function handleDeleteCategory(id: string) {
    if (!confirm("Excluir esta categoria? Os itens ficarão sem categoria.")) return;
    await api.categories.remove(id);
    await loadAll();
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🛒 Lista de Compras</h1>
        <div className="header-actions">
          <button className="secondary" onClick={() => setCategoryManagerOpen(true)}>
            Categorias
          </button>
          <button onClick={openCreateForm}>+ Novo item</button>
        </div>
      </header>

      <div className="toolbar">
        <input
          type="search"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="banner error">{error}</div>}
      {loading ? (
        <p className="empty">Carregando...</p>
      ) : (
        <ProductList
          products={visibleProducts}
          searchingIds={searchingIds}
          onTogglePurchased={handleTogglePurchased}
          onEdit={openEditForm}
          onDelete={handleDeleteProduct}
        />
      )}

      {isFormOpen && (
        <ProductForm
          categories={categories}
          initialProduct={editingProduct}
          onSubmit={handleFormSubmit}
          onCancel={() => setFormOpen(false)}
        />
      )}

      {isCategoryManagerOpen && (
        <CategoryManager
          categories={categories}
          onCreate={handleCreateCategory}
          onRename={handleRenameCategory}
          onDelete={handleDeleteCategory}
          onClose={() => setCategoryManagerOpen(false)}
        />
      )}
    </div>
  );
}
