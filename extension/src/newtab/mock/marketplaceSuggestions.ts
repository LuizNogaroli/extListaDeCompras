import type { Product } from "../types";

export interface MarketplaceSuggestion {
  id: string;
  marketplace: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  thumbnailColor: string;
  freeShipping: boolean;
  fastDelivery: boolean;
  cashbackPercent: number | null;
}

// Dados fictícios só para validar a interface. Na Fase 2 (ver docs/roadmap.md) isso
// vira uma busca real nos marketplaces cadastrados no painel admin.
const MARKETPLACES = [
  {
    name: "Mercado Livre",
    priceFactor: 0.95,
    rating: 4.6,
    reviews: 812,
    color: "#fde68a",
    freeShipping: true,
    fastDelivery: true,
    cashbackPercent: 3,
  },
  {
    name: "Amazon",
    priceFactor: 1.05,
    rating: 4.4,
    reviews: 1523,
    color: "#fdba74",
    freeShipping: true,
    fastDelivery: true,
    cashbackPercent: null,
  },
  {
    name: "Magalu",
    priceFactor: 0.9,
    rating: 4.2,
    reviews: 356,
    color: "#93c5fd",
    freeShipping: false,
    fastDelivery: false,
    cashbackPercent: 5,
  },
  {
    name: "Shopee",
    priceFactor: 0.85,
    rating: 4.0,
    reviews: 97,
    color: "#f9a8d4",
    freeShipping: false,
    fastDelivery: false,
    cashbackPercent: null,
  },
  {
    name: "Americanas",
    priceFactor: 0.98,
    rating: 4.1,
    reviews: 640,
    color: "#a7f3d0",
    freeShipping: true,
    fastDelivery: false,
    cashbackPercent: 2,
  },
  {
    name: "Casas Bahia",
    priceFactor: 1.02,
    rating: 3.9,
    reviews: 210,
    color: "#c4b5fd",
    freeShipping: false,
    fastDelivery: false,
    cashbackPercent: 4,
  },
  {
    name: "AliExpress",
    priceFactor: 0.78,
    rating: 4.3,
    reviews: 2431,
    color: "#fca5a5",
    freeShipping: false,
    fastDelivery: false,
    cashbackPercent: null,
  },
  {
    name: "KaBuM!",
    priceFactor: 1.08,
    rating: 4.7,
    reviews: 980,
    color: "#67e8f9",
    freeShipping: true,
    fastDelivery: true,
    cashbackPercent: null,
  },
  {
    name: "Submarino",
    priceFactor: 1.0,
    rating: 4.0,
    reviews: 145,
    color: "#d9f99d",
    freeShipping: false,
    fastDelivery: false,
    cashbackPercent: 6,
  },
  {
    name: "Carrefour",
    priceFactor: 0.88,
    rating: 3.8,
    reviews: 88,
    color: "#fed7aa",
    freeShipping: false,
    fastDelivery: false,
    cashbackPercent: null,
  },
];

export function generateMockSuggestions(product: Product): MarketplaceSuggestion[] {
  const basePrice = product.estimatedPrice ?? 50;
  return MARKETPLACES.map((marketplace, index) => ({
    id: `${product.id}-${index}`,
    marketplace: marketplace.name,
    title: `${product.name} — oferta em ${marketplace.name}`,
    description: product.description || "Sem descrição informada para este item.",
    price: Number((basePrice * marketplace.priceFactor).toFixed(2)),
    rating: marketplace.rating,
    reviews: marketplace.reviews,
    thumbnailColor: marketplace.color,
    freeShipping: marketplace.freeShipping,
    fastDelivery: marketplace.fastDelivery,
    cashbackPercent: marketplace.cashbackPercent,
  }));
}
