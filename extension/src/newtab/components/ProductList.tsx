import type { Product } from "../types";
import { MarketplaceSearchPanel } from "./MarketplaceSearchPanel";

interface ProductListProps {
  products: Product[];
  searchingIds: Set<string>;
  onTogglePurchased: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function ProductList({ products, searchingIds, onTogglePurchased, onEdit, onDelete }: ProductListProps) {
  if (products.length === 0) {
    return <p className="empty">Nenhum item encontrado. Adicione o primeiro item da sua lista.</p>;
  }

  const groups = new Map<string, Product[]>();
  for (const product of products) {
    const key = product.category?.name ?? "Sem categoria";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(product);
  }

  return (
    <div className="product-groups">
      {Array.from(groups.entries()).map(([categoryName, items]) => (
        <section key={categoryName} className="product-group">
          <h3>{categoryName}</h3>
          <ul className="product-list">
            {items.map((product) => (
              <li key={product.id} className={product.purchased ? "purchased" : ""}>
                <div className="product-row">
                  <div className="product-main">
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={product.purchased}
                        onChange={() => onTogglePurchased(product)}
                      />
                    </label>
                    <div className="product-info">
                      <div className="product-title-row">
                        <span className="product-name">{product.name}</span>
                        {product.estimatedPrice != null && (
                          <span className="product-price">{currency.format(product.estimatedPrice)}</span>
                        )}
                      </div>
                      {product.description && <p className="product-description">{product.description}</p>}
                      {product.suppliers.length > 0 && (
                        <ul className="supplier-chips">
                          {product.suppliers.map((s) => (
                            <li key={s.id}>
                              {s.url ? (
                                <a href={s.url} target="_blank" rel="noreferrer">
                                  {s.name}
                                </a>
                              ) : (
                                s.name
                              )}
                              {s.price != null && <span> · {currency.format(s.price)}</span>}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="product-actions">
                    <button className="ghost" onClick={() => onEdit(product)}>
                      Editar
                    </button>
                    <button className="ghost danger" onClick={() => onDelete(product)}>
                      Excluir
                    </button>
                  </div>
                </div>
                <MarketplaceSearchPanel product={product} isSearching={searchingIds.has(product.id)} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
