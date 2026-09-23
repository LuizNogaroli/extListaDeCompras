# Roadmap

## Fase 1 — CRUD da lista de compras (feito)

- Extensão Chrome (ícone → nova aba com o app).
- Backend local (Express + Prisma + SQLite) com CRUD de categorias, itens e fornecedores possíveis.
- Estrutura pronta para migrar o banco para um serviço online sem reescrever código (ver `docs/architecture.md`).

## Fase 2 — Pesquisa por IA e marketplaces (planejado, não implementado)

Ideia registrada para não se perder, a ser detalhada em um novo plano quando for a hora de implementar:

- **Cadastro de marketplaces** (admin): nome, URL base, template de link de afiliado, ativo/inativo.
  - Modelo sugerido: `Marketplace { id, name, baseUrl, affiliateLinkTemplate, active }`.
- **Módulo de pesquisa por IA**: para cada item da lista, usar nome + descrição + categoria como entrada para buscar/gerar sugestões de compra nos marketplaces cadastrados e ativos.
  - Resultado por item: uma lista ordenada de opções ("Opção 1", "Opção 2", "Opção 3"...), cada uma com marketplace, preço encontrado, e o **link de afiliado do dono do projeto** (não o link direto do produto).
  - Modelo sugerido: `Suggestion { id, productId, marketplaceId, title, price, affiliateUrl, rank, createdAt }`.
- **Painel administrativo**: área restrita ao dono do projeto (autenticação separada dos usuários finais) para:
  - Cadastrar/editar/desativar marketplaces e templates de afiliado.
  - Acompanhar quais sugestões estão sendo geradas/clicadas (métricas básicas de monetização).
- **Pré-requisitos técnicos** a decidir quando essa fase começar: provedor de IA (ex.: API de busca + LLM para interpretar/rankear resultados), forma de buscar preços reais nos marketplaces (API oficial de cada um, scraping, ou parceria de afiliados que já fornece feed de produtos), e autenticação de usuários (hoje o backend não tem login).

Esta fase não deve começar até a Fase 1 estar validada em uso real.
