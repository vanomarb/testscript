// GoDaManhua.js
import axios from "axios";
import * as cheerio from "cheerio";

axios.defaults.timeout = 30000;

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

    async fetchHtml(url) {
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

        const mangas = $(".container > .cardlist .pb-2 a")
            .map((i, el) => {
                const element = $(el);
                const title = element.find("h3").text().trim();
                const href = element.attr("href");
                const imgSrc = element.find("img").attr("src");
                const url = href.split("/manga/")[1]?.replace(/\/$/, "");
                const thumb = imgSrc.includes("url=")
                    ? new URL(imgSrc).searchParams.get("url")
                    : imgSrc;
                const thumbnail = 'https://pro-api.mgsearcher.com/_next/image?url=' + encodeURIComponent(thumb) + '&w=250&q=75';
                return { title, url, thumbnail, type };
            })
            .get();

        const hasNextPage = $("a[aria-label='NEXT'] button").length > 0;
        return { mangas, hasNextPage };
    }

    async fetchLatest(page = 1) {
        const url = `newss/page/`;
        return this.fetchPopular(page, url, 'latest');
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
        console.log(titleEl.find("span").first().text().trim());
        const author = elements
            .eq(1)
            .children()
            .slice(1)
            .map((i, el) => $(el).text().replace(/ ,$/, ""))
            .get()
            .join(", ");

        const genres = [
            ...elements
                .eq(2)
                .children()
                .slice(1)
                .map((i, el) => $(el).text().replace(/ ,$/, ""))
                .get(),
            ...elements
                .eq(3)
                .children()
                .map((i, el) => $(el).text().replace(/^#/, ""))
                .get(),
        ];

        const mangaId = $("#mangachapters").attr("data-mid");
        const description = `${elements.eq(4).text().trim()}\n\nID: ${mangaId}`;
        const thumb = $("img.object-cover").attr("src");
        const thumbnail = 'https://pro-api.mgsearcher.com/_next/image?url=' + encodeURIComponent(thumb) + '&w=250&q=75';

        const rating = main.find("#MangaCard").find("span.text-xs").text();
        // remove text just numbers and characters only 
        let rate = rating.replace(/[^\d\/().]+/g, ' ratings');
        const chapters = await this.fetchChapters(mangaId);
        const chapterCount = chapters.length;


        return { title, status, author, genres, description, thumbnail, id: mangaId, rate, chapters, chapterCount };
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

    // --- Pages (API-based) --- //
    async fetchChapterImages(mangaId, chapterId) {
        if (!mangaId || !chapterId) throw new Error("请刷新漫画");

        const url = `${this.apiBase}/chapter/getinfo?m=${mangaId}&c=${chapterId}`;
        const json = await this.fetchJson(url);

        const images = json?.data?.info?.images?.images || [];
        return images.map((img, i) => ({
            index: i,
            imageUrl: img.src || img.url || img,
        }));
    }
}
