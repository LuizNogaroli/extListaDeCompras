import { useState } from "react";
import type { Category } from "../types";

interface CategoryManagerProps {
  categories: Category[];
  onCreate: (name: string) => Promise<void>;
  onRename: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export function CategoryManager({ categories, onCreate, onRename, onDelete, onClose }: CategoryManagerProps) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    await onCreate(newName.trim());
    setNewName("");
  }

  function startEditing(category: Category) {
    setEditingId(category.id);
    setEditingName(category.name);
  }

  async function confirmRename(id: string) {
    if (editingName.trim()) {
      await onRename(id, editingName.trim());
    }
    setEditingId(null);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Categorias</h2>

        <form className="inline-form" onSubmit={handleCreate}>
          <input
            type="text"
            placeholder="Nova categoria"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button type="submit">Adicionar</button>
        </form>

        <ul className="category-list">
          {categories.map((category) => (
            <li key={category.id}>
              {editingId === category.id ? (
                <>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    autoFocus
                  />
                  <button onClick={() => confirmRename(category.id)}>Salvar</button>
                  <button className="ghost" onClick={() => setEditingId(null)}>
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <span>{category.name}</span>
                  <button className="ghost" onClick={() => startEditing(category)}>
                    Renomear
                  </button>
                  <button className="ghost danger" onClick={() => onDelete(category.id)}>
                    Excluir
                  </button>
                </>
              )}
            </li>
          ))}
          {categories.length === 0 && <li className="empty">Nenhuma categoria cadastrada.</li>}
        </ul>

        <button className="secondary" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  );
}
