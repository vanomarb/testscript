// src/components/MangaChapters.js
import Component from '../core/components.js';
import loader from './loader.js';
import { useState } from '../hooks/useState.js';
import { reloadImage } from '../helpers/reload_image.js';

export default class MangaChapters extends Component {
    constructor(props) {
        super(props);
        this.router = props.router;
        this.mangaId = props.mangaId;
        this.section = props.section;
        this.chapter = props.chapter;
    }
    async mounted() {
        await this.fetchChapterImages();
    }

    setup() {
        this.state = {
            jsdata: [],
            loading: true,
            error: null
        };
    }

    async fetchChapterImages() {
        try {
            // const apiUrl = `${this.API_URL}/api/images/${this.mangaId}/${this.section}/${this.chapter}`;
            // console.log("apiUrl:", apiUrl);
            // const res = await fetch(apiUrl);
            // const data = await res.json();
            this.state.jsdata = [{ "img_url": "_1.jpg", "translations": [{ "text": "第四百七十九话 .全都上来了", "bbox": [82, 46, 634, 100], "confidence": 0.8293900153631193, "verified": false }] }, { "img_url": "_2.jpg", "translations": [{ "text": "包子漫蜚", "bbox": [107, 31, 315, 93], "confidence": 0.22630971670150757, "verified": false }, { "text": "包子漫蜚", "bbox": [565, 33, 718, 83], "confidence": 0.17429092526435852, "verified": false }, { "text": "02@0", "bbox": [101, 83, 317, 119], "confidence": 0.000007411288152070483, "verified": false }, { "text": "本漫董由包子漫董收集整理。更多免囊漫董萧纺周", "bbox": [339, 103, 875, 139], "confidence": 0.000854745951938264, "verified": false }, { "text": "止3-督已", "bbox": [449, 139, 775, 177], "confidence": 6.707003820788241e-8, "verified": false }, { "text": "矢二", "bbox": [92, 308, 334, 334], "confidence": 0.017796714052181792, "verified": false }, { "text": "你看到前面的金色", "bbox": [283, 432, 556, 482], "confidence": 0.9787829258340587, "verified": false }, { "text": "海洋吗?  我们守在", "bbox": [284, 475, 555, 519], "confidence": 0.7934917641550916, "verified": false }, { "text": "这里。是想横渡这", "bbox": [285, 514, 556, 559], "confidence": 0.8374620925789886, "verified": false }, { "text": "片金色海洋。", "bbox": [283, 555, 473, 599], "confidence": 0.9860770940687055, "verified": false }, { "text": "这海洋中的火焰力", "bbox": [552, 586, 822, 630], "confidence": 0.8981198820994665, "verified": false }, { "text": "量极其可怕。只有", "bbox": [555, 627, 823, 671], "confidence": 0.8070367965608355, "verified": false }, { "text": "火系妖族操控七品", "bbox": [555, 665, 823, 709], "confidence": 0.9648218220091258, "verified": false }, { "text": "以上宝器方可渡过。", "bbox": [555, 705, 841, 749], "confidence": 0.9102639046427097, "verified": false }, { "text": "小子。〉小心", "bbox": [615, 1395, 823, 1439], "confidence": 0.1444546618335094, "verified": false }, { "text": "一点!", "bbox": [619, 1437, 703, 1477], "confidence": 0.9557396415332706, "verified": false }, { "text": "哦?  这火焰", "bbox": [347, 1595, 517, 1637], "confidence": 0.7226585735006251, "verified": false }, { "text": "很厉害吗?", "bbox": [345, 1633, 503, 1677], "confidence": 0.96557384717786, "verified": false }] }];
            this.state.loading = false;
            this.render();
            // await this.addImages();
        } catch (err) {
            console.error('❌ Error fetching images:', err);
            this.state.error = err;
            this.state.loading = false;
            this.render();
        }
    }

    template() {
        if (this.state.loading) {
            return loader();
        }

        if (this.state.error) {
            return `<div class="error text-red-500 text-center">Failed to load chapters.</div>`;
        }

        return `
            <div id="comic-type" hidden>Manhua</div>
            ${this.state.jsdata
                .map(
                    (item) => `
                <div class="comic-image-container bg-gray-200 rounded-lg shadow-lg w-full max-w-6xl mx-auto">
                    <img
                        class="comic-image w-full object-contain shadow" src="${this.isProd || !item.img_url.startsWith("http") ? `http://localhost:3000/images/${item.img_url}` : item.img_url}"
                    />
                </div>
                    `
                )
                .join('')}
    `;
    }

    setEvent() {
        // you can add UI-related events here later
    }

    async addImages() {
        const { jsdata } = this.state;
        if (!Array.isArray(jsdata) || jsdata.length === 0) {
            console.warn("⚠️ No images found in state");
            return;
        }

        console.log(`🖼️ Loading ${jsdata.length} images...`);

        // Select existing image containers
        const containers = document.querySelectorAll(".comic-image-container");

        jsdata.forEach(async (item, i) => {
            const container = containers[i];
            if (!container) return;

            const img = container.querySelector("img");
            if (!img) return;

            // Set proper image URL
            const imgUrl =
                this.isProd || !item.img_url.startsWith("http")
                    ? `http://localhost:3000/images/${item.img_url}`
                    : item.img_url;

            // Load image with fade-in effect
            await reloadImage({
                imgUrl,
                container,
                imageData: item,
                onSuccess: (image, imageData) => {
                    const rawTranslations = Array.isArray(imageData?.translations)
                        ? imageData.translations
                        : [];
                    const normalized = rawTranslations.map(normalizeTranslation);
                    renderSpeechBubbles(container, image, normalized);
                },
            });
        });
        return true;
    }


    normalizeTranslation(t) {
        let bbox = t.bbox;
        if (Array.isArray(bbox)) {
            bbox = { x0: bbox[0], y0: bbox[1], x1: bbox[2], y1: bbox[3] };
        }
        const text = t.text ?? t.en ?? t.fr ?? t.pt ?? '';
        return { ...t, bbox, text };
    }

    groupLinesIntoSpeechBubbles(translations, verticalThreshold = 100, horizontalThreshold = 30) {
        const speechBubbles = [];
        translations.forEach((line) => {
            let added = false;
            for (const bubble of speechBubbles) {
                const last = bubble[bubble.length - 1];
                if (!last) continue;
                const closeY = Math.abs(line.bbox.y0 - last.bbox.y0) < verticalThreshold;
                const closeX = Math.abs(line.bbox.x0 - last.bbox.x0) < horizontalThreshold;
                if (closeY && closeX) {
                    bubble.push(line);
                    added = true;
                    break;
                }
            }
            if (!added) speechBubbles.push([line]);
        });
        return speechBubbles;
    }

    renderSpeechBubbles(container, image, translations) {
        const speechBubbles = this.groupLinesIntoSpeechBubbles(translations);
        if (!speechBubbles.length) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const displayW = image.clientWidth;
        const displayH = image.clientHeight;
        const dpr = window.devicePixelRatio || 1;

        canvas.width = displayW * dpr;
        canvas.height = displayH * dpr;
        canvas.style.width = `${displayW}px`;
        canvas.style.height = `${displayH}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.drawImage(image, 0, 0, displayW, displayH);

        const scaleX = displayW / image.naturalWidth;
        const scaleY = displayH / image.naturalHeight;

        for (const bubble of speechBubbles) {
            const mergedText = bubble.map((l) => l.text).join(' ');
            const minX = Math.min(...bubble.map((l) => l.bbox.x0));
            const minY = Math.min(...bubble.map((l) => l.bbox.y0));
            const maxX = Math.max(...bubble.map((l) => l.bbox.x1));
            const maxY = Math.max(...bubble.map((l) => l.bbox.y1));
            const bbox = { x0: minX, y0: minY, x1: maxX, y1: maxY };

            const left = bbox.x0 * scaleX;
            const top = bbox.y0 * scaleY;
            const width = (bbox.x1 - bbox.x0) * scaleX;
            const height = (bbox.y1 - bbox.y0) * scaleY;

            ctx.fillStyle = 'white';
            ctx.fillRect(left, top, width, height);

            const textDiv = document.createElement('div');
            textDiv.className = 'translation-text';
            textDiv.innerText = mergedText.toUpperCase();
            textDiv.style.position = 'absolute';
            textDiv.style.left = `${left}px`;
            textDiv.style.top = `${top}px`;
            textDiv.style.width = `${width}px`;
            textDiv.style.height = `${height}px`;
            textDiv.style.textAlign = 'center';
            textDiv.style.display = 'flex';
            textDiv.style.alignItems = 'center';
            textDiv.style.justifyContent = 'center';
            textDiv.style.fontFamily = 'blambot';
            textDiv.style.zIndex = 10;

            container.appendChild(textDiv);
        }

        image.src = canvas.toDataURL('image/jpeg', 0.95);
    }
}
