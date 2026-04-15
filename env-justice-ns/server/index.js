import express from "express";
import cors from "cors";
import compression from "compression";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
// 3001 is often taken (other dev tools, brokers). Override with PORT= if needed.
const PORT = Number(process.env.PORT) || 3782;
const isProd = process.env.NODE_ENV === "production";

app.use(compression());
// Dev: reflect browser Origin so Vite works on 5173, 5174, … if ports shift.
app.use(cors({ origin: isProd ? false : true }));
app.use(express.json());

let cached;
function loadData() {
  if (cached) return cached;
  const path = join(__dirname, "data.json");
  cached = JSON.parse(readFileSync(path, "utf8"));
  return cached;
}

app.get("/api/content", (_req, res) => {
  try {
    res.json(loadData());
  } catch {
    res.status(500).json({ error: "Failed to load content" });
  }
});

const dist = join(__dirname, "..", "dist");
const indexHtml = join(dist, "index.html");

if (isProd && !existsSync(indexHtml)) {
  console.error(
    "[env-justice-ns] dist/index.html missing. Run `npm run build` from the project root before starting in production."
  );
}

if (isProd && existsSync(dist)) {
  app.use(express.static(dist, { index: "index.html", fallthrough: true }));
  // SPA / deep links: send index.html for non-API routes that are not static files
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    res.sendFile(indexHtml, (err) => {
      if (err) next(err);
    });
  });
}

const server = app.listen(PORT);
server.on("error", (err) => {
  console.error(
    `[env-justice-ns] Cannot listen on port ${PORT} (${err.code || err.message}).`,
    "Another app may be using it — try PORT=3783 or stop the other process."
  );
  process.exit(1);
});
server.on("listening", () => {
  console.log(`API ${isProd ? "+ static " : ""}on http://localhost:${PORT}`);
});
