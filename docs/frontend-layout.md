# Layout da nova aba — guia de referência

Documentação de como a interface da extensão (`extension/src/newtab`) foi construída: estrutura de componentes, sistema de design (cores/espaçamentos), e o padrão da "cortina" de pesquisa por marketplace. Serve de referência para manter consistência ao adicionar novas telas ou estender as existentes.

## 1. Árvore de componentes

```
App.tsx                              (estado global: categorias, produtos, filtros, modais)
├── header .app-header                (título + botões "Categorias" / "+ Novo item")
├── .toolbar                          (busca por nome + filtro por categoria)
├── ProductList.tsx                   (agrupa produtos por categoria)
│   └── por produto:
│       ├── .product-row              (checkbox, nome, preço, descrição, fornecedores, ações)
│       └── MarketplaceSearchPanel.tsx (a "cortina" — um por item)
├── ProductForm.tsx                   (modal — criar/editar item + fornecedores dinâmicos)
└── CategoryManager.tsx               (modal — CRUD de categorias)
```

Arquivos:
- [App.tsx](../extension/src/newtab/App.tsx) — estado e orquestração.
- [App.css](../extension/src/newtab/App.css) — único arquivo de estilos de todo o app (sem CSS-in-JS, sem módulos por componente).
- [components/ProductList.tsx](../extension/src/newtab/components/ProductList.tsx)
- [components/ProductForm.tsx](../extension/src/newtab/components/ProductForm.tsx)
- [components/CategoryManager.tsx](../extension/src/newtab/components/CategoryManager.tsx)
- [components/MarketplaceSearchPanel.tsx](../extension/src/newtab/components/MarketplaceSearchPanel.tsx)
- [mock/marketplaceSuggestions.ts](../extension/src/newtab/mock/marketplaceSuggestions.ts) — gerador de dados fictícios da "cortina".

## 2. Sistema de design (tokens)

Definido em `:root` no topo do `App.css`:

| Variável | Valor | Uso |
|---|---|---|
| `--bg` | `#f5f6f8` | Fundo da página |
| `--surface` | `#ffffff` | Fundo de cards, modais, inputs |
| `--border` | `#e2e4e9` | Bordas de cards, inputs, divisores |
| `--text` | `#1f2430` | Texto principal |
| `--text-muted` | `#6b7280` | Texto secundário (descrições, labels, metadados) |
| `--primary` | `#2563eb` | Botões principais, links, estado ativo |
| `--primary-hover` | `#1d4ed8` | Hover de botão primário |
| `--danger` | `#dc2626` | Ações destrutivas (excluir) |

Fonte: `system-ui, -apple-system, "Segoe UI", sans-serif` (sem web fonts — carrega instantâneo, sem FOUT).

Layout geral: `.app` centraliza o conteúdo em `max-width: 880px`, com `padding: 32px 20px 80px`. É uma coluna única — não há sidebar nem grid complexo.

### Botões — variantes por classe, não por componente

Não existe um componente `<Button>`; é sempre `<button>` nativo com classes utilitárias combináveis:

- (sem classe) → botão primário azul sólido (`--primary`), usado para ações principais ("Salvar", "+ Novo item").
- `.secondary` → fundo branco com borda, para ações neutras ("Cancelar", "Fechar", "Categorias").
- `.ghost` → transparente, texto azul, para ações leves dentro de listas ("Editar", "Renomear", "+ Adicionar").
- `.ghost.danger` → igual ao `.ghost`, mas em vermelho, para "Excluir".
- `:disabled` → opacidade 0.6 em qualquer botão (usado no botão "Ver oferta" da cortina, que é só ilustrativo).

## 3. Padrão de modal

`ProductForm` e `CategoryManager` usam a mesma estrutura de duas camadas:

```html
<div class="modal-backdrop" onClick={fecha}>       <!-- overlay escuro, fixed inset:0 -->
  <div class="modal" onClick={e => e.stopPropagation()}>  <!-- card branco centralizado -->
    ...conteúdo...
  </div>
</div>
```

- `.modal-backdrop`: `position: fixed; inset: 0`, fundo `rgba(15,18,25,.45)`, centraliza o filho com flex. Clicar nele fecha o modal.
- `.modal`: `max-width: 480px`, `max-height: 90vh` com `overflow-y: auto` (formulários longos rolam dentro do modal, não da página).
- O `stopPropagation()` no card evita que cliques dentro do modal fechem ele por engano (bug clássico de clique borbulhar até o backdrop).

Para criar um novo modal, siga exatamente essa estrutura — é o que garante o comportamento de overlay/fechar-ao-clicar-fora consistente em todo o app.

## 4. Anatomia do card de item (`ProductList.tsx`)

Cada `<li>` da lista é um card (`.product-list li`: fundo branco, borda, `border-radius: 10px`) com duas partes empilhadas verticalmente:

```
<li class="{purchased ? 'purchased' : ''}">
  <div class="product-row">              ← linha de topo (flex horizontal)
    <div class="product-main">           ← checkbox + informações (ocupa o espaço flexível)
      <checkbox/>
      <div class="product-info">
        nome + preço (.product-title-row)
        descrição (.product-description)
        fornecedores (.supplier-chips)
      </div>
    </div>
    <div class="product-actions">        ← Editar / Excluir, empilhados à direita
  </div>
  <MarketplaceSearchPanel />             ← a cortina, abaixo da linha de topo, full-width
</li>
```

Ponto importante: `.product-row` tem o `display:flex` que antes ficava direto no `<li>`. Ele foi extraído para uma classe própria justamente para permitir empilhar a cortina *abaixo* da linha principal sem quebrar o layout flex horizontal dela.

Estado "comprado": a classe `.purchased` no `<li>` reduz a opacidade do card inteiro (`opacity: .55`) e risca o nome (`text-decoration: line-through` em `.product-name`) — tudo via CSS, sem lógica condicional extra no JSX além da classe.

## 5. A "cortina" de pesquisa (`MarketplaceSearchPanel.tsx`)

O componente mais elaborado da interface. Um por item da lista, com três estados possíveis:

### Estado 1 — Pesquisando (`isSearching = true`)

Renderizado só quando o item acabou de ser criado nesta sessão do navegador (ver `App.tsx`, `searchingIds`/`markAsSearching`). Mostra uma linha não-clicável com spinner CSS puro (`.search-spinner`: borda circular com um lado colorido, `animation: spin .8s linear infinite`) e o texto "Pesquisando produtos/preços/descrições...". Depois de 2200ms (`setTimeout` em `App.tsx`), o id sai do `Set` e o componente recalcula para o estado 2.

### Estado 2 — Fechado (padrão)

Um `<button class="search-panel-toggle">` ocupando 100% da largura: ícone 🔍, título "Pesquisa de Produtos/Preço/Descrição" + contador (`· N encontrados`, em `--text-muted`, dentro do mesmo `<span>` do título), e um chevron (`▾`) que gira 180° via `transition: transform` quando `open` é `true`. O contador reflete `allSuggestions.length` — o total que a "busca" encontrou, não o total filtrado.

### Estado 3 — Aberto (`open = true`)

Corpo (`.search-panel-body`, fundo levemente acinzentado `#f7f8fb` para diferenciar do card branco) contendo, nesta ordem:

1. **Aviso** (`.search-panel-disclaimer`): deixa explícito que são dados de exemplo — importante para não passar a falsa impressão de que a busca real já existe.
2. **Filtros** (`.search-panel-filters`, flex-wrap):
   - Um `<select>` "Ordenar por" (Relevância / Menor preço / Maior preço / Melhor avaliação).
   - Checkboxes estilo "pill" (`.checkbox-pill`): frete grátis, cashback, entrega rápida. Usam o seletor CSS `:has(input:checked)` para mudar de aparência (fundo/borda/texto azuis) sem precisar de uma classe React condicional — é puro CSS reagindo ao estado nativo do checkbox. **Nota:** `:has()` exige Chrome 105+ (não é problema aqui, o alvo é sempre Chrome via extensão).
3. **Lista de resultados** (`.search-result-list`) ou, se o filtro não bater com nada, `<p class="empty">Nenhuma oferta encontrada com esses filtros.</p>`.
4. **Paginação** (`.search-pagination`): seletor de itens por página (5/10/20) à esquerda, controles "‹ Anterior / Página X de Y / Próxima ›" à direita.

Cada item da lista de resultados (`.search-result-item`) é uma linha horizontal:

```
[thumb colorido]  [marketplace + avaliação, título, descrição, badges]  [preço + botão "Ver oferta"]
```

- `.search-result-thumb`: quadrado 44×44 com `border-radius: 8px`, cor de fundo por marketplace (não é foto real — é a inicial do nome do marketplace sobre uma cor sólida, até existir busca real com imagens).
- Badges (`.badge` / `.badge-cashback`): pills pequenas mostrando 🚚 Frete grátis, ⚡ Entrega rápida, 💰 X% cashback — só aparecem quando o dado existe naquela oferta.

### Lógica de dados (tudo local ao componente, sem backend)

Arquivo [mock/marketplaceSuggestions.ts](../extension/src/newtab/mock/marketplaceSuggestions.ts): uma lista fixa de 10 marketplaces (nome, fator de preço, avaliação, nº de reviews, cor, frete grátis, entrega rápida, % cashback). `generateMockSuggestions(product)` aplica o `priceFactor` de cada marketplace sobre o `estimatedPrice` do produto (fallback R$ 50 se não informado) — assim cada item mostra preços plausíveis e proporcionais a ele mesmo, sem aleatoriedade (mesmo produto sempre gera os mesmos números).

Dentro do componente: `applyFilters()` (checkboxes) → `sortSuggestions()` (select) → `.slice()` (paginação), nessa ordem, recalculado a cada render — não há memoização porque a lista é pequena (10 itens) e não compensa a complexidade.

## 6. Convenções gerais

- **Sem biblioteca de componentes** (nem Tailwind, nem MUI/Chakra) — CSS puro em um único arquivo, classes utilitárias reaproveitadas (`.ghost`, `.secondary`, `.empty`, `.badge`).
- **Nomenclatura de classes**: `bloco-elemento` simples (ex.: `search-panel-toggle`, `product-title-row`), sem BEM rígido com `__`/`--`, mas mantendo o prefixo do "bloco" pai para achar fácil no CSS.
- **Nenhuma imagem/ícone externo**: tudo é emoji (🔍 🚚 ⚡ 💰 🛒 ★) ou CSS puro (spinner, chevron). Evita dependência de rede e simplifica o bundle.
- **Formatação de moeda**: `new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })`, instanciado uma vez no topo de cada componente que precisa (não é um util compartilhado hoje — se aparecer um terceiro lugar usando isso, vale extrair para `newtab/format.ts`).
- **Idioma da interface**: pt-BR em todo texto visível, incluindo mensagens de erro/confirmação.

## 7. Como estender

- **Novo filtro de checkbox na cortina**: adicionar o campo em `FilterState` e no objeto de cada marketplace em `marketplaceSuggestions.ts`, tratar em `applyFilters()`, adicionar o `<label class="checkbox-pill">` correspondente em `MarketplaceSearchPanel.tsx`. O CSS já é genérico (`.checkbox-pill`), não precisa de estilo novo.
- **Novo critério de ordenação**: adicionar o valor em `SortOption` e um `if` em `sortSuggestions()`, mais a `<option>` no `<select>`.
- **Trocar dados fictícios por busca real (Fase 2)**: o ponto de troca é só a função `generateMockSuggestions(product)` — ela pode virar uma chamada assíncrona (`await api.suggestions.search(product.id)`) sem mudar nada no componente visual, só adaptando para estado de loading assíncrono real em vez do `setTimeout` simulado em `App.tsx`.
- **Novo modal**: copiar a estrutura da seção 3 (`modal-backdrop` + `modal` + `stopPropagation`).
