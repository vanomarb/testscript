import fs from "fs";
import path from "path";
import fetch from "node-fetch";
// import EasyOCR from "easyocr-js";
import { fileURLToPath } from "url";
import { groupTextBubbles } from "../helpers/grouptext.js";

// const ocr = new EasyOCR();

/**
 * Download image from URL to TMP_DIR
 */
async function downloadImage(url) {
    try {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const TMP_DIR = path.join(__dirname, "../tmp");

        // ✅ Ensure tmp folder exists
        if (!fs.existsSync(TMP_DIR)) {
            fs.mkdirSync(TMP_DIR, { recursive: true });
            console.log("🗂️ Created tmp directory:", TMP_DIR);
        }

        console.log("⬇️ Downloading image:", url);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

        const buffer = Buffer.from(await res.arrayBuffer());
        const filename = path.join(TMP_DIR, `img_${Date.now()}.jpg`);
        fs.writeFileSync(filename, buffer);
        console.log("✅ Image saved to:", filename);
        return filename;
    } catch (err) {
        console.error("❌ Failed to download image:", err.message);
        throw err;
    }
}

/**
 * Main OCR function
 * @param {string[]} imagePaths - Array of local paths or URLs
 * @returns {Promise<object[]>}
 */
async function easyocrWrapper(ocr, imagePaths) {
    const results = [];

    try {
        // console.log("🔧 Initializing EasyOCR...");
        // await ocr.init(["ch_sim"]); // Simplified Chinese
        // console.log("✅ OCR initialized successfully");

        for (const imagePath of imagePaths) {
            // Download if URL, else use local path
            const localPath = imagePath.startsWith("http")
                ? await downloadImage(imagePath)
                : imagePath;

            // Normalize Windows backslashes
            const fixedPath = localPath.replace(/\\/g, "/");
            console.log("📸 Processing image:", fixedPath);
            console.time("OCR Process");

            const rawResultObj = await ocr.readText(fixedPath);
            console.timeEnd("OCR Process");

            if (!rawResultObj || !Array.isArray(rawResultObj.data)) {
                console.warn("⚠️ OCR returned unexpected result:", rawResultObj);
                continue;
            }

            const rawResults = rawResultObj.data;
            const formattedTranslations = rawResults.map((item) => {
                let bbox = item.bbox;

                if (!bbox) {
                    bbox = [0, 0, 0, 0];
                } else if (Array.isArray(bbox[0])) {
                    // case: [[x1,y1],[x2,y2],[x3,y3],[x4,y4]]
                    const xs = bbox.map((p) => p[0]);
                    const ys = bbox.map((p) => p[1]);
                    bbox = [
                        Math.min(...xs),
                        Math.min(...ys),
                        Math.max(...xs),
                        Math.max(...ys),
                    ];
                } else if (Array.isArray(bbox) && bbox.length === 8) {
                    // case: [x1, y1, x2, y2, x3, y3, x4, y4]
                    const xs = [bbox[0], bbox[2], bbox[4], bbox[6]];
                    const ys = [bbox[1], bbox[3], bbox[5], bbox[7]];
                    bbox = [
                        Math.min(...xs),
                        Math.min(...ys),
                        Math.max(...xs),
                        Math.max(...ys),
                    ];
                } else if (Array.isArray(bbox) && bbox.length === 4) {
                    // already rectangular
                    bbox = bbox.map((n) => Math.round(n));
                } else {
                    bbox = [0, 0, 0, 0];
                }

                return {
                    text: item.text,
                    bbox,
                    confidence: item.confidence ?? 0,
                    verified: false,
                };
            });

            const groupedTranslations = groupTextBubbles(formattedTranslations);

            results.push({
                img_url: imagePath,
                translations: groupedTranslations,
            });

            // Delete temporary file if downloaded
            if (imagePath.startsWith("http")) {
                fs.unlink(localPath, (err) => {
                    if (err) console.warn(`⚠️ Failed to delete temp file: ${localPath}`);
                });
            }
        }

        console.log("✅ OCR complete!");
        return results;
    } catch (err) {
        console.error("❌ OCR Error:", err.message);
        return [];
    } finally {
        // await ocr.close();
    }
}

export default easyocrWrapper;
