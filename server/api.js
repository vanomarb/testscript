// server/api.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config"; // optional for .env support

import { baozi, mangabaka } from "./modules.js"; // your centralized scrapers
import easyocr from "./ocr/ocr.js";

// Determine current directory (ESM-safe __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 🧠 Detect environment
const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || (isProd ? 8080 : 4000);

// 🧩 Allow CORS (for dev only)
app.use(
  cors({
    origin: isProd ? "https://yourdomain.com" : "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// ✅ Parse JSON bodies (optional for POST endpoints)
app.use(express.json());

/* -------------------------------------------------------------------------- */
/*                                API ROUTES                                  */
/* -------------------------------------------------------------------------- */

// Get manga info (Baozimh)
app.get("/api/info/:manga", async (req, res) => {
  try {
    const response = await baozi.getInfo(req.params.manga);
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch manga info" });
  }
});

// Get chapters
app.get("/api/chapters/:manga", async (req, res) => {
  try {
    const response = await baozi.getChapters(req.params.manga);
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chapters" });
  }
});

// Get images
app.get("/api/images/:comic_id/:section_slot/:chapter_slot", async (req, res) => {
  try {
    const { comic_id, section_slot, chapter_slot } = req.params;
    const response = await baozi.getImages(comic_id, section_slot, chapter_slot);
    const data = response.images.map((img_url, index) => ({ id: index + 1, img_url: img_url, translations: [] }));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

// Search manga (Baozimh)
app.get("/api/search/:keyword", async (req, res) => {
  try {
    const response = await baozi.searchByKeyword(req.params.keyword);
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
});

// Example endpoint for another scraper (Mangabaka)
app.get("/api/mangabaka/:manga", async (req, res) => {
  try {
    const response = await mangabaka.getInfo(req.params.manga);
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch from Mangabaka" });
  }
});

app.post("/api/ocr", async (req, res) => {
  try {
    const imagePath = req.body;
    const results = await easyocr(imagePath);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OCR failed" });
  }
});
/* -------------------------------------------------------------------------- */
/*                              FRONTEND SERVING                              */
/* -------------------------------------------------------------------------- */

// Serve built Vite frontend (for production)
const distPath = path.join(__dirname, "../src/dist");
app.use(express.static(distPath));

// Fallback route — for Vue/React/jQuery SPAs
// app.use((req, res, next) => {
//   if (req.method === "GET" && req.accepts("html") && !req.path.startsWith("/api/")) {
//     return res.sendFile(path.join(distPath, "index.html"));
//   }
//   next();
// });

/* -------------------------------------------------------------------------- */
/*                                   START                                    */
/* -------------------------------------------------------------------------- */

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  if (!isProd) console.log("🔧 Dev mode: expects frontend on http://localhost:3000");
});
