// server.js
import axios from "axios";
import * as cheerio from 'cheerio';
axios.defaults.timeout = 30000; // all requests = 30 seconds

export class Baozimh {
    constructor() {
        this.domain = "baozimh.com";
        this.mirrors = [
            "www.baozimh.com", "www.webmota.com", "www.kukuc.co", "www.twmanga.com", "www.dinnerku.com",
            "cn.baozimh.com", "cn.webmota.com", "cn.kukuc.co", "cn.twmanga.com", "cn.dinnerku.com",
            "tw.baozimh.com", "tw.webmota.com", "tw.kukuc.co", "tw.twmanga.com", "tw.dinnerku.com",
        ];
    }

    async sendRequest(url, referer) {
        try {
            let response = await axios.get(url, {
                headers: {
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Referer": referer
                }
            });
            return response.data;
        } catch (err) {
            console.error("Request failed:", url, err.message);
            return null;
        }
    }

    // helper to rotate mirrors dynamically
    async fetchWithMirrors(pathBuilder) {
        const mirrorTimeout = 5000; // 5 seconds per mirror

        for (let mirror of this.mirrors) {
            let url = pathBuilder(mirror);
            let referer = `https://${mirror}/`;

            try {
                // race: axios vs timeout
                const html = await Promise.race([
                    this.sendRequest(url, referer), // real request
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error(`Mirror ${mirror} timed out`)), mirrorTimeout)
                    )
                ]);

                if (html) return { html, mirror };
            } catch (err) {
                console.warn(`Mirror failed: ${mirror} -> ${err.message}`);
                continue; // try next mirror
            }
        }

        throw new Error("All mirrors failed");
    }



    async getInfo(manga) {
        const { html } = await this.fetchWithMirrors(mirror => `https://${mirror}/comic/${manga}`);
        let $ = cheerio.load(html);
        let infoBox = $("div.comics-detail");
        if (!infoBox.length) {
            return {
                'error': 'Manga not found'
            };
        }

        return {
            cover: infoBox.find("div.de-info-wr amp-img").attr("src") || "",
            title: infoBox.find("h1.comics-detail__title").text().trim(),
            authors: infoBox.find("h2.comics-detail__author").text().trim(),
            summary: infoBox.find("p.comics-detail__desc").text().trim(),
            status: "Ongoing",
            extras: {
                genres: infoBox.find("span.tag").map((i, el) => $(el).text().trim()).get()
            }
        };
    }

    async getChapters(manga) {
        const { html, mirror } = await this.fetchWithMirrors(m => `https://${m}/comic/${manga}`);
        let $ = cheerio.load(html);
        let chapters = [];

        $("div.comics-chapters").each((i, el) => {
            let $a = $(el).find("a");
            if (!$a.length) return;

            let rawHref = $a.attr("href").trim();
            let absHref = rawHref.startsWith("http") ? rawHref : `https://${mirror}${rawHref}`;
            let name = $a.text().trim();

            let urlObj = new URL(absHref, `https://${mirror}`);
            let comicId = urlObj.searchParams.get("comic_id");
            let sectionSlot = urlObj.searchParams.get("section_slot");
            let chapterSlot = urlObj.searchParams.get("chapter_slot");

            let chapterUrl, chapterSlug;
            if (comicId && sectionSlot && chapterSlot) {
                chapterUrl = `https://${mirror}/comic/chapter/${comicId}/${sectionSlot}_${chapterSlot}.html`;
                chapterSlug = `/comic/chapter/${comicId}/${sectionSlot}_${chapterSlot}.html`;
            } else {
                chapterUrl = absHref;
            }

            chapters.push({
                url: chapterUrl,
                name,
                comic_id: comicId,
                section_slot: sectionSlot,
                chapter_slot: chapterSlot,
                chapter_slug: chapterSlug
            });
        });

        return chapters;
    }

    async getImages(comicId, sectionSlot, chapterSlot) {
        const { html } = await this.fetchWithMirrors(
            m => `https://${m}/comic/chapter/${comicId}/${sectionSlot}_${chapterSlot}.html`
        );

        let $ = cheerio.load(html);
        let images = $("ul.comic-contain amp-img").map((i, el) => $(el).attr("data-src")).get();
        let saveNames = images.map((_, i) => String(i + 1).padStart(3, "0"));

        return { images, saveNames };
    }

    async searchByKeyword(keyword) {
        const { html } = await this.fetchWithMirrors(
            () => `https://www.baozimh.com/search?q=${encodeURIComponent(keyword)}`
        );

        let $ = cheerio.load(html);
        let results = {};

        $("div.comics-card").each((i, el) => {
            let $poster = $(el).find("a.comics-card__poster");
            let $info = $(el).find("a.comics-card__info");

            let name = $info.find("div.comics-card__title h3").text().trim();
            let url = $info.attr("href").split("/").pop();
            let authors = $info.find("small").text().trim().split("/").join(", ");
            let genres = $poster.find("div.tabs.cls span").map((i, span) => $(span).text().trim()).get();

            results[name] = {
                domain: this.domain,
                url,
                thumbnail: $poster.find("amp-img").attr("src"),
                authors,
                genres: genres.join(", ")
            };
        });

        return results;
    }
}

