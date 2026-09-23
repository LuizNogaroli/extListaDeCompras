import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

export default defineManifest({
  manifest_version: 3,
  name: "Lista de Compras",
  description: "Sua lista de compras com categorias, preços estimados e fornecedores.",
  version: pkg.version,
  action: {
    default_title: "Abrir Lista de Compras",
  },
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  host_permissions: ["http://localhost:3333/*"],
});
