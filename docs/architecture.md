# Arquitetura — Fase 1

## Visão geral

```
[Ícone da extensão] --clique--> [service worker] --chrome.tabs.create--> [Nova aba: app React]
                                                                                  |
                                                                                  | fetch (REST)
                                                                                  v
                                                                    [Backend Express :3333]
                                                                                  |
                                                                                  v
                                                                        [SQLite local (dev.db)]
```

## `backend/`

- Node.js + TypeScript + Express + Prisma.
- Banco local em SQLite (`backend/prisma/dev.db`), gerado por `npx prisma migrate dev`.
- Migração para produção: trocar `provider` (de `sqlite` para `postgresql`) e `DATABASE_URL` em `backend/prisma/schema.prisma` / `.env`, rodar `prisma migrate deploy` no banco novo. Nenhuma query do código precisa mudar.
- Modelos: `Category`, `Product`, `Supplier` (ver `backend/prisma/schema.prisma`).
- Rotas: `/categories` e `/products` (CRUD completo), fornecedores como sub-rota de produto (`/products/:id/suppliers`).
- CORS liberado para `chrome-extension://*` e `http://localhost*`, já que a extensão roda em uma origem `chrome-extension://<id>` que muda por instalação.

## `extension/`

- Manifest V3, gerado via `@crxjs/vite-plugin` a partir de `extension/manifest.config.ts`.
- `src/background/index.ts`: service worker que escuta o clique no ícone (`chrome.action.onClicked`) e abre `src/newtab/index.html` em uma nova aba.
- `src/newtab/`: app React (a "nova aba" do app):
  - `App.tsx`: estado principal, busca categorias/produtos no backend, filtros (busca por nome + categoria).
  - `components/ProductList.tsx`: lista agrupada por categoria, com preço estimado, fornecedores e ação de marcar como comprado.
  - `components/ProductForm.tsx`: criar/editar item, com lista dinâmica de fornecedores possíveis.
  - `components/CategoryManager.tsx`: CRUD simples de categorias.
  - `components/MarketplaceSearchPanel.tsx`: cortina de "pesquisa por marketplace" por item (filtros, ordenação, paginação — dados de exemplo por enquanto).
  - `mock/marketplaceSuggestions.ts`: gerador dos dados de exemplo usados pela cortina acima.
  - `api/client.ts`: cliente HTTP fino sobre `fetch`, aponta para `http://localhost:3333`.
- `host_permissions` no manifest libera acesso a `http://localhost:3333/*` (necessário para o `fetch` funcionar a partir de uma página de extensão).

Guia detalhado de layout/CSS/componentes: [frontend-layout.md](frontend-layout.md).

## Como rodar localmente

```bash
# 1. Backend
cd backend
npm install
npx prisma migrate dev   # cria o SQLite local (só precisa 1x, ou após mudar o schema)
npm run dev               # http://localhost:3333

# 2. Extensão
cd extension
npm install
```

## Como testar sem instalar/desinstalar toda hora

A tela da nova aba (`extension/src/newtab`) não usa nenhuma API do `chrome.*` — só faz `fetch` para o backend. Isso dá dois jeitos de testar:

**1. Iteração rápida de UI (sem extensão nenhuma instalada)**

```bash
cd extension
npm run dev   # Vite dev server em http://localhost:5173
```

Abra `http://localhost:5173/src/newtab/index.html` em qualquer aba normal do Chrome (ou em qualquer navegador). É o app completo, com hot-reload a cada salvamento — nenhuma instalação de extensão envolvida. Ótimo para ajustar telas, formulários, CSS etc.

**2. Comportamento real da extensão (ícone → nova aba)**

Isso só precisa ser feito **uma vez**:

1. Com `npm run dev` rodando em `extension/` (o mesmo comando acima já gera e atualiza `extension/dist`), abra `chrome://extensions`.
2. Ative "Modo do desenvolvedor" → "Carregar sem compactação" → selecione a pasta `extension/dist`.

A partir daí, enquanto o `npm run dev` estiver rodando, qualquer alteração no código atualiza a extensão já carregada automaticamente (o `@crxjs/vite-plugin` cuida disso) — **não precisa remover e recarregar a extensão de novo**. Só é necessário reinstalar manualmente se o `manifest.json` mudar de forma incompatível (ex.: mudar `permissions`) ou se o Chrome mostrar um aviso pedindo para recarregar.

Para gerar só o build de produção (sem dev server), use `npm run build` em `extension/`, que gera `extension/dist` uma única vez.
