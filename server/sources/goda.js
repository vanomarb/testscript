// GoDaManhua.js
import axios from "axios";
// import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

axios.defaults.timeout = 30000;
// pool of random User-Agents (you can expand this)
const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_3_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15",
    "Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:118.0) Gecko/20100101 Firefox/118.0",
];

// helper to pick random
const randomUA = () => userAgents[Math.floor(Math.random() * userAgents.length)];
// --- Static genre translations map --- //
// --- Static genre & category translations map --- //
const GENRE_MAP = {
    // 📚 Categories / Source types
    "全部": "All",
    "韩漫": "Korean Manhwa",
    "热门漫画": "Hot Manga",
    "国漫": "Chinese Manhua",
    "其他": "Others",
    "日漫": "Japanese Manga",
    "欧美": "Western Comics",

    // 🎭 Genres
    "复仇": "Revenge",
    "古风": "Ancient Style",
    "奇幻": "Fantasy",
    "逆袭": "Counterattack",
    "异能": "Superpower",
    "宅向": "Otaku",
    "穿越": "Time Travel",
    "热血": "Hot-Blooded",
    "纯爱": "Pure Love",
    "系统": "System",
    "重生": "Rebirth",
    "冒险": "Adventure",
    "灵异": "Supernatural",
    "大女主": "Strong Female Lead",
    "剧情": "Drama",
    "恋爱": "Romance",
    "玄幻": "Xuanhuan",
    "女神": "Goddess",
    "科幻": "Sci-Fi",
    "魔幻": "Magic",
    "推理": "Mystery",
    "猎奇": "Grotesque",
    "治愈": "Healing",
    "都市": "Urban",
    "异形": "Alien",
    "青春": "Youth",
    "末日": "Apocalypse",
    "悬疑": "Suspense",
    "修仙": "Cultivation",
    "战斗": "Battle",
    "热门推荐": "Hot Picks"
};


export class GoDaManhua {
    constructor(mirrorIndex = 0) {
        this.mirrors = [
            "baozimh.org",
            "godamh.com",
            "m.baozimh.one",
            "bzmh.org",
            "g-mh.org",
            "m.g-mh.org",
        ];
        this.apiBase = "https://api-get-v3.mgsearcher.com/api";
    }

    async fetchViaProxy(url, referer) {
        const proxy = "https://corsproxy.io/?";
        const proxiedUrl = proxy + encodeURIComponent(url);

        const headers = {
            Referer: referer,
            "User-Agent": "Mozilla/5.0",
        };

        const res = await axios.get(proxiedUrl, { headers });
        return res.data;
    }

    // 🔁 Try all mirrors automatically
    async fetchWithMirrors(pathBuilder, parseAsHtml = false) {
        const mirrorTimeout = 7000; // 7 seconds timeout per mirror

        for (const mirror of this.mirrors) {
            const url = pathBuilder(mirror);
            const referer = `https://${mirror}/`;

            try {
                const response = await Promise.race([
                    this.sendRequest(url, referer, parseAsHtml),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error(`Mirror ${mirror} timed out`)), mirrorTimeout)
                    ),
                ]);

                if (response) {
                    console.log(`✅ Success via mirror: ${mirror}`);
                    return { ...response, mirror };
                }
            } catch (err) {
                console.warn(`⚠️ Mirror failed: ${mirror} -> ${err.message}`);
            }
        }

        throw new Error("❌ All mirrors failed.");
    }

    // 🌐 Handles both JSON and HTML requests
    async sendRequest(url, referer, parseAsHtml) {
        try {
            const headers = {
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
                Referer: referer,
                Origin: referer,
            };

            const res = await axios.get(url, { headers, timeout: 7000 });

            if (parseAsHtml) {
                const $ = cheerio.load(res.data);
                return { $, html: res.data };
            }

            return { json: res.data };
        } catch (err) {
            // Optional CORS fallback
            if (err.message.includes("Network Error") || err.code === "ERR_NETWORK") {
                console.warn(`🌐 CORS or Cloudflare -> Retrying via proxy...`);
                return this.fetchViaProxy(url, referer, parseAsHtml);
            }

            throw err;
        }
    }

    // ⚡️ simple Cloudflare workaround
    // Cloudflare blocks browsers (CORS), but backend requests bypass it.
    async fetchJson(url) {
        // const { json } = await this.fetchWithMirrors(mirror => `https://${mirror}/${url}`);
        const json = await axios.get(url, { headers: this.headers });
        return json.data;
    }

    async fetchHtml(url = '') {
        const { html } = await this.fetchWithMirrors(mirror => `https://${mirror}/${url}`, true);
        return cheerio.load(html);
    }

    // --- Mirror helpers --- //
    listMirrors() {
        return this.mirrors.map((m, i) => ({ index: i, url: `https://${m}` }));
    }

    // --- Popular / Latest (uses GoDa HTML) --- //
    async fetchPopular(page = 1, url = 'hots/page/', type = 'popular') {
        const finalUrl = `${url}${page}`;
        const $ = await this.fetchHtml(finalUrl);

        // Step 1: Collect raw manga data first
        const rawMangas = $(".container > .cardlist .pb-2 a")
            .map((i, el) => {
                const element = $(el);
                const title = element.find("h3").text().trim();
                const href = element.attr("href");
                const imgSrc = element.find("img").attr("src");
                const url = href.split("/manga/")[1]?.replace(/\/$/, "");
                const thumb = imgSrc.includes("url=")
                    ? new URL(imgSrc).searchParams.get("url")
                    : imgSrc;
                const thumbnail =
                    "https://pro-api.mgsearcher.com/_next/image?url=" +
                    encodeURIComponent(thumb) +
                    "&w=250&q=75";

                return { title, url, thumbnail, type };
            })
            .get();

        // Step 2: Extract all titles for batch translation
        const titles = rawMangas.map((m) => m.title);

        // Step 3: Batch translate (one request only)
        let translations = [];
        try {
            const translated = await this.fetchTranslate(titles, "en");
            // make sure it returns same-length array
            translations = Array.isArray(translated) ? translated : [];
        } catch (err) {
            console.warn("Batch translation failed:", err.message);
            // fallback: no translations
            translations = [];
        }
        // Step 4: Merge translations back to mangas
        const mangas = rawMangas.map((m, i) => ({
            ...m,
            translatedTitle: translations[0][i] || m.title,
        }));

        // Step 5: Pagination detection
        const hasNextPage = $("a[aria-label='NEXT'] button").length > 0;

        return { mangas, hasNextPage };
    }


    async fetchNewComics(page = 1) {
        const url = `dayup/page/`;
        return this.fetchPopular(page, url, 'new');
    }

    // --- Latest Updates (uses GoDa HTML) --- //
    async fetchLatest() {
        const request = await axios.get("https://m.g-mh.org");
        const $ = cheerio.load(request.data);

        const rawMangas = [];
        // Each flex-row div contains several manga cards

        // Step 1: Collect raw manga data first
        $('.flex.flex-row.w-full.gap-unit-sm').each((_, container) => {
            $(container)
                .find('a.slicarda')
                .each((_, el) => {
                    const $el = $(el);
                    const title = $el.find('h3.slicardtitle').text().trim();
                    const url = $el.attr('href')?.trim();
                    const img = $el.find('img.slicardimg').attr('src');
                    const chapterElem = $el.find('.slicardtitlep').text().trim();
                    let match = chapterElem.match(/\d+/); // Extracts digits only
                    let chapter = match ? `Chapter ${match[0]}` : chapterElem;
                    const time = $el.find('.slicardtagp').text().trim();
                    const thumbnail = "https://pro-api.mgsearcher.com/_next/image?url=" + encodeURIComponent(img) + "&w=250&q=75";
                    const type = 'latest';
                    rawMangas.push({
                        title,
                        url,
                        thumbnail,
                        chapter,
                        time,
                        type
                    });
                });
        });

        // Step 2: Extract all titles for batch translation
        const titles = rawMangas.map((m) => m.title);

        // Step 3: Batch translate (one request only)
        let translations = [];
        try {
            const translated = await this.fetchTranslate(titles, "en");
            // make sure it returns same-length array
            translations = Array.isArray(translated) ? translated : [];
        } catch (err) {
            console.warn("Batch translation failed:", err.message);
            // fallback: no translations
            translations = [];
        }
        // Step 4: Merge translations back to mangas
        const mangas = rawMangas.map((m, i) => ({
            ...m,
            translatedTitle: translations[0][i] || m.title,
        }));

        return {
            mangas
        };
    }


    // --- Manga details (same as GoDa) --- //
    async fetchDetails(slug) {
        const url = `manga/${slug}`;
        const $ = await this.fetchHtml(url);

        const main = $("main").first();
        const titleEl = main.find("h1").first();
        const elements = titleEl.parent().parent().children();

        const statusMap = {
            "連載中": "ONGOING",
            "Ongoing": "ONGOING",
            "完結": "COMPLETED",
            "停止更新": "CANCELLED",
            "休刊": "ON_HIATUS",
        };

        const title = titleEl.contents().first().text().trim();
        const status = statusMap[titleEl.find("span").first().text().trim()] || "UNKNOWN";
        const author = elements
            .eq(1)
            .children()
            .slice(1)
            .map((i, el) => $(el).text().trim().replace(" ,", ""))
            .get()
            .join(", ");

        const rawGenres = [
            ...elements
                .eq(2)
                .children()
                .slice(1)
                .map((i, el) => $(el).text().replace(/ ,$/, "").trim().replace(" ,", ""))
                .get(),
            ...elements
                .eq(3)
                .children()
                .map((i, el) => $(el).text().replace(/^#/, "").trim().replace("#", ""))
                .get(),
        ];

        // Translate genres if match found
        const genres = rawGenres.map(g => GENRE_MAP[g] || g);
        const mangaId = $("#mangachapters").attr("data-mid");
        const description = `${elements.eq(4).text().trim()}`;
        const thumbnail = $("img.object-cover").attr("src");
        const englishTitle = main.find("p.text-sm.line-clamp-1.overflow-hidden")
            .text()
            ?.trim()
            ?.split(/:|：/)?.[1]
            ?.trim() || null;
        // const thumbnail = 'https://pro-api.mgsearcher.com/_next/image?url=' + encodeURIComponent(thumb) + '&w=250&q=75';

        const rating = main.find("#MangaCard").find("span.text-xs").text();
        // remove text just numbers and characters only 
        let rate = rating.replace(/[^\d\/().]+/g, ' ratings');
        const chapters = await this.fetchChapters(mangaId);
        const chapterCount = chapters.length;
        const translated = await this.fetchTranslate([title, description], 'en');

        return { translatedTitle: translated[0][0], translatedDescription: translated[0][1], englishTitle, title, status, author, genres: genres || rawGenres, description, thumbnail, id: mangaId, rate, chapters, chapterCount };
    }

    // --- Chapter list (API-based) --- //
    async fetchChapters(mangaId) {
        if (!mangaId) throw new Error("Missing mangaId");

        const url = `${this.apiBase}/manga/get?mid=${mangaId}&mode=all`;
        const json = await this.fetchJson(url);
        if (!json?.data?.chapters) throw new Error("No chapters found");

        return json.data.chapters
            .map((ch) => ({
                name: ch.attributes.title,
                updatedAt: ch.attributes.updatedAt,
                order: ch.attributes.order,
                slug: ch.attributes.slug,
                chapterId: ch.id,
                mangaId,
            }))
            .reverse();
    }

    async fetchChapterImages(mangaId, slug) {
        if (!mangaId || !slug) throw new Error("missing parameters");

        const url = `manga/${mangaId}/${slug}`;
        const $ = await this.fetchHtml(url);

        const images = [];
        const chapterName = $("#chapterContent").attr('data-ct');
        const prevLink = $("#preChapterLink").attr("href") || $("#prevchaptera").attr("href");
        const nextLink = $("#nextChapterLink").attr("href") || $("#nextchaptera").attr("href");
        $("#chapcontent").find('img').each((i, el) => {
            const element = $(el);
            const chapterUrl = element.attr("data-src") || element.attr("src");
            const name = `iamge_${i + 1}`;
            images.push({ name, imageUrl: chapterUrl });
        });
        console.log($.html());


        return { images, chapterName, prevLink, nextLink };
    }

    // --- Pages (API-based) --- //
    async fetchChapterImagesAPI(mangaId, slug, cid, mid) {
        if (!cid || !mid) throw new Error("missing parameters");

        const url = `${this.apiBase}/chapter/getinfo?m=${mid}&c=${cid}`;
        const json = await this.fetchJson(url);

        const rawImages = json?.data?.info?.images?.images || [];

        // Create a deep copy of json.data (so we don’t mutate original)
        const data = structuredClone(json.data);

        // Remove the nested images array safely (to avoid duplicates)
        if (data?.info?.images?.images) {
            delete data.info.images;
        }

        const images = rawImages.map((img, i) => ({
            index: i,
            imageUrl: img.url.startsWith("/hp") ? `https://t40-1-4.g-mh.online${img.url}` : img.url,
        }));

        if (images.length === 0) {
            // fallback to HTML method
            return this.fetchChapterImages(mangaId, slug, chapterId);
        }

        // Return cleaned data and images
        return { images, data };
    }



    async fetchTranslate(text, targetLanguage = "en", proxy = null) {
        const requestData = [[text, "auto", targetLanguage], "te"];

        // Randomized “genuine” headers
        const headers = {
            "Content-Type": "application/json+protobuf",
            "X-Goog-Api-Key": "AIzaSyATBXajvzQLTDHEQbcpq0Ihe0vWDHmO520",
            "User-Agent": randomUA(),
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://translate.google.com/"
        };

        // Proxy config (optional)
        const axiosConfig = {
            headers,
            timeout: 8000,
        };

        if (proxy) {
            // proxy can be http, https, socks5, etc.
            axiosConfig.proxy = {
                host: proxy.host,
                port: proxy.port,
                protocol: proxy.protocol || "http",
                auth: proxy.auth || undefined,
            };
        }

        try {
            const response = await axios.post(
                "https://translate-pa.googleapis.com/v1/translateHtml",
                requestData,
                axiosConfig
            );

            return response.data;
        } catch (error) {
            console.error("Error when translating:", error.message);
            return null;
        }
    }
}
