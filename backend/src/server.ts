import express from "express";
import cors from "cors";
import { categoriesRouter } from "./routes/categories.routes.js";
import { productsRouter } from "./routes/products.routes.js";

const app = express();

// A extensão roda em uma origem chrome-extension://<id>, que varia por instalação/máquina,
// então liberamos qualquer origem chrome-extension:// aqui (uso local, sem dados sensíveis).
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin.startsWith("chrome-extension://") || origin.startsWith("http://localhost")) {
        return callback(null, true);
      }
      callback(new Error("Origem não permitida"));
    },
  })
);
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/categories", categoriesRouter);
app.use("/products", productsRouter);

const port = Number(process.env.PORT) || 3333;
app.listen(port, () => {
  console.log(`Backend rodando em http://localhost:${port}`);
});
