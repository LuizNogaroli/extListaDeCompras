import { useState } from "react";
import type { Product } from "../types";
import { generateMockSuggestions, type MarketplaceSuggestion } from "../mock/marketplaceSuggestions";
import { formatCurrency } from "../format";

type SortOption = "relevancia" | "menor-preco" | "maior-preco" | "avaliacao";

interface FilterState {
  freeShipping: boolean;
  cashback: boolean;
  fastDelivery: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  freeShipping: false,
  cashback: false,
  fastDelivery: false,
};

const PAGE_SIZE_OPTIONS = [5, 10, 20];

function sortSuggestions(items: MarketplaceSuggestion[], sort: SortOption) {
  const sorted = [...items];
  if (sort === "menor-preco") return sorted.sort((a, b) => a.price - b.price);
  if (sort === "maior-preco") return sorted.sort((a, b) => b.price - a.price);
  if (sort === "avaliacao") return sorted.sort((a, b) => b.rating - a.rating);
  return sorted;
}

function applyFilters(items: MarketplaceSuggestion[], filters: FilterState) {
  return items.filter((item) => {
    if (filters.freeShipping && !item.freeShipping) return false;
    if (filters.cashback && item.cashbackPercent == null) return false;
    if (filters.fastDelivery && !item.fastDelivery) return false;
    return true;
  });
}

interface MarketplaceSearchPanelProps {
  product: Product;
  isSearching: boolean;
}

export function MarketplaceSearchPanel({ product, isSearching }: MarketplaceSearchPanelProps) {
  const [open, setOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>("relevancia");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  if (isSearching) {
    return (
      <div className="search-panel">
        <div className="search-panel-toggle search-panel-loading">
          <span className="search-spinner" aria-hidden="true" />
          <span className="search-panel-title">Pesquisando produtos/preços/descrições...</span>
        </div>
      </div>
    );
  }

  const allSuggestions = generateMockSuggestions(product);
  const filteredSorted = sortSuggestions(applyFilters(allSuggestions, filters), sort);
  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filteredSorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function toggleFilter(key: keyof FilterState) {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    setPage(1);
  }

  return (
    <div className="search-panel">
      <button
        type="button"
        className="search-panel-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="search-panel-icon">🔍</span>
        <span className="search-panel-title">
          Pesquisa de Produtos/Preço/Descrição
          <span className="search-panel-count"> · {allSuggestions.length} encontrados</span>
        </span>
        <span className={`search-panel-chevron ${open ? "open" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="search-panel-body">
          <p className="search-panel-disclaimer">
            Prévia com dados de exemplo — a busca real nos marketplaces ainda não está implementada.
          </p>

          <div className="search-panel-filters">
            <label className="sort-field">
              Ordenar por
              <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)}>
                <option value="relevancia">Relevância</option>
                <option value="menor-preco">Menor preço</option>
                <option value="maior-preco">Maior preço</option>
                <option value="avaliacao">Melhor avaliação</option>
              </select>
            </label>

            <div className="filter-checkboxes">
              <label className="checkbox-pill">
                <input
                  type="checkbox"
                  checked={filters.freeShipping}
                  onChange={() => toggleFilter("freeShipping")}
                />
                Frete grátis
              </label>
              <label className="checkbox-pill">
                <input
                  type="checkbox"
                  checked={filters.cashback}
                  onChange={() => toggleFilter("cashback")}
                />
                Cashback
              </label>
              <label className="checkbox-pill">
                <input
                  type="checkbox"
                  checked={filters.fastDelivery}
                  onChange={() => toggleFilter("fastDelivery")}
                />
                Entrega rápida
              </label>
            </div>
          </div>

          {filteredSorted.length === 0 ? (
            <p className="empty">Nenhuma oferta encontrada com esses filtros.</p>
          ) : (
            <>
              <ul className="search-result-list">
                {pageItems.map((suggestion) => (
                  <li key={suggestion.id} className="search-result-item">
                    <div className="search-result-thumb" style={{ background: suggestion.thumbnailColor }}>
                      {suggestion.marketplace.charAt(0)}
                    </div>
                    <div className="search-result-info">
                      <div className="search-result-title-row">
                        <span className="search-result-marketplace">{suggestion.marketplace}</span>
                        <span className="search-result-rating">
                          ★ {suggestion.rating.toFixed(1)} ({suggestion.reviews})
                        </span>
                      </div>
                      <p className="search-result-title">{suggestion.title}</p>
                      <p className="search-result-description">{suggestion.description}</p>
                      {(suggestion.freeShipping ||
                        suggestion.fastDelivery ||
                        suggestion.cashbackPercent != null) && (
                        <div className="search-result-badges">
                          {suggestion.freeShipping && <span className="badge">🚚 Frete grátis</span>}
                          {suggestion.fastDelivery && <span className="badge">⚡ Entrega rápida</span>}
                          {suggestion.cashbackPercent != null && (
                            <span className="badge badge-cashback">
                              💰 {suggestion.cashbackPercent}% cashback
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="search-result-price-col">
                      <span className="search-result-price">{formatCurrency(suggestion.price)}</span>
                      <button
                        type="button"
                        className="ghost"
                        disabled
                        title="Disponível quando a busca real for implementada"
                      >
                        Ver oferta
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="search-pagination">
                <label className="page-size-field">
                  Itens por página
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="page-controls">
                  <button
                    type="button"
                    className="ghost"
                    disabled={currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    ‹ Anterior
                  </button>
                  <span>
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    type="button"
                    className="ghost"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    Próxima ›
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
