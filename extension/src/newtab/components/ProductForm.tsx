import { useState } from "react";
import type { Category, Product, ProductInput, SupplierInput } from "../types";

interface ProductFormProps {
  categories: Category[];
  initialProduct: Product | null;
  onSubmit: (input: ProductInput) => Promise<void>;
  onCancel: () => void;
}

function toSupplierInputs(product: Product | null): SupplierInput[] {
  if (!product) return [];
  return product.suppliers.map((s) => ({
    name: s.name,
    url: s.url ?? undefined,
    price: s.price ?? undefined,
    notes: s.notes ?? undefined,
  }));
}

export function ProductForm({ categories, initialProduct, onSubmit, onCancel }: ProductFormProps) {
  const [name, setName] = useState(initialProduct?.name ?? "");
  const [description, setDescription] = useState(initialProduct?.description ?? "");
  const [estimatedPrice, setEstimatedPrice] = useState(
    initialProduct?.estimatedPrice != null ? String(initialProduct.estimatedPrice) : ""
  );
  const [categoryId, setCategoryId] = useState(initialProduct?.categoryId ?? "");
  const [suppliers, setSuppliers] = useState<SupplierInput[]>(toSupplierInputs(initialProduct));
  const [submitting, setSubmitting] = useState(false);

  function updateSupplier(index: number, patch: Partial<SupplierInput>) {
    setSuppliers((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function addSupplier() {
    setSuppliers((prev) => [...prev, { name: "" }]);
  }

  function removeSupplier(index: number) {
    setSuppliers((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        estimatedPrice: estimatedPrice ? Number(estimatedPrice) : undefined,
        categoryId: categoryId || undefined,
        suppliers: suppliers.filter((s) => s.name.trim()),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2>{initialProduct ? "Editar item" : "Novo item"}</h2>

        <label>
          Nome *
          <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </label>

        <label>
          Descrição
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </label>

        <div className="form-row">
          <label>
            Preço estimado (R$)
            <input
              type="number"
              step="0.01"
              min="0"
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(e.target.value)}
            />
          </label>

          <label>
            Categoria
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="suppliers-section">
          <div className="suppliers-header">
            <span>Fornecedores possíveis</span>
            <button type="button" className="ghost" onClick={addSupplier}>
              + Adicionar
            </button>
          </div>

          {suppliers.map((supplier, index) => (
            <div className="supplier-row" key={index}>
              <input
                placeholder="Nome"
                value={supplier.name}
                onChange={(e) => updateSupplier(index, { name: e.target.value })}
              />
              <input
                placeholder="Link (opcional)"
                value={supplier.url ?? ""}
                onChange={(e) => updateSupplier(index, { url: e.target.value })}
              />
              <input
                placeholder="Preço"
                type="number"
                step="0.01"
                min="0"
                value={supplier.price ?? ""}
                onChange={(e) =>
                  updateSupplier(index, { price: e.target.value ? Number(e.target.value) : undefined })
                }
              />
              <button type="button" className="ghost danger" onClick={() => removeSupplier(index)}>
                Remover
              </button>
            </div>
          ))}
          {suppliers.length === 0 && <p className="empty">Nenhum fornecedor adicionado ainda.</p>}
        </div>

        <div className="form-actions">
          <button type="button" className="secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" disabled={submitting}>
            {submitting ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
