// server/api.js
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config"; // optional for .env support

import { baozi, mangabaka, goda } from "./modules.js"; // your centralized scrapers
import easyocr from "./ocr/ocr.js";
import EasyOCR from "easyocr-js";
const ocr = new EasyOCR();

// Initialize OCR reader once
(async () => {
  try {
    console.log("🧠 Initializing OCR reader once...");
    await ocr.init(["ch_sim"]); // ✅ runs only at server start
    console.log("✅ OCR ready!");
  } catch (err) {
    console.error("❌ Failed to initialize OCR:", err);
  }
})();

// Determine current directory (ESM-safe __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 🧠 Detect environment
const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || (isProd ? 8080 : 4000);

// 🧩 Allow CORS (for dev only)
// app.use(
//   cors({
//     origin: isProd ? "https://yourdomain.com" : "http://localhost:3000",
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   })
// );
app.use(cors());
// ✅ Parse JSON bodies (optional for POST endpoints)
app.use(express.json());

/* -------------------------------------------------------------------------- */
/*                                API ROUTES                                  */
/* -------------------------------------------------------------------------- */
app.get("/popular", async (req, res) => {
    try {
        const page = parseInt(req.query.page || "1", 10);
        const result = await goda.fetchPopular(page);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/latest", async (req, res) => {
    try {
        const page = parseInt(req.query.page || "1", 10);
        const result = await goda.fetchLatest(page);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/chapters", async (req, res) => {
    try {
        const id = req.query.id;
        const result = await goda.fetchChapters(id);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get("/manga", async (req, res) => {
    try {
        const slug = req.query.slug;
        const result = await goda.fetchDetails(slug);
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


// app.get("/api/manga-list", async (req, res) => {
//   try {
//     const response = await baozi.landingPage();
//     res.json(response);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch manga list" });
//   }
// });


// // Get manga info (Baozimh)
// app.get("/api/info/:manga", async (req, res) => {
//   try {
//     const response = await baozi.getInfo(req.params.manga);
//     res.json(response);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch manga info" });
//   }
// });

// // Get chapters
// app.get("/api/chapters/:manga", async (req, res) => {
//   try {
//     const response = await baozi.getChapters(req.params.manga);
//     res.json(response);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch chapters" });
//   }
// });

// // Get images
// app.get("/api/images/:comic_id/:section_slot/:chapter_slot", async (req, res) => {
//   try {
//     const { comic_id, section_slot, chapter_slot } = req.params;
//     const response = await baozi.getImages(comic_id, section_slot, chapter_slot);
//     const data = response.images.map((img_url, index) => ({ id: index + 1, img_url: img_url, translations: [] }));
//     res.json(data);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch images" });
//   }
// });

// // Search manga (Baozimh)
// app.get("/api/search/:keyword", async (req, res) => {
//   try {
//     const response = await baozi.searchByKeyword(req.params.keyword);
//     res.json(response);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Search failed" });
//   }
// });

// // Example endpoint for another scraper (Mangabaka)
// app.get("/api/mangabaka/:manga", async (req, res) => {
//   try {
//     const response = await mangabaka.getInfo(req.params.manga);
//     res.json(response);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch from Mangabaka" });
//   }
// });

app.post("/api/ocr", async (req, res) => {
  try {
    const imagePath = req.body;
    const results = await easyocr(ocr, imagePath);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "OCR failed" });
  }
});

// ✅ Proxy route for remote images
app.get("/api/proxy", async (req, res) => {
  const imageUrl = req.query.url;
  if (!imageUrl) return res.status(400).send("Missing URL");

  try {
    console.log("🔁 Proxying image:", imageUrl);
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} - ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    res.set("Content-Type", contentType);
    res.set("Access-Control-Allow-Origin", "*");

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("❌ Proxy error:", err);
    res.status(500).send("Failed to proxy image");
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
