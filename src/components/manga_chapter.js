// src/components/MangaChapters.js
import Component from '../core/components.js';
import loader from './loader.js';
// import { useState } from '../hooks/useState.js';
import helpers from '../helpers/helpers.js';

export default class MangaChapters extends Component {
    constructor(props) {
        super(props);
        this.router = props.router;
        this.mangaId = props.mangaId;
        this.chapter = props.chapter;
    }
    async mounted() {
        await this.fetchChapterImages();

        //setInterval and clear interval if text is translate .translated-text
        const translationCheckInterval = setInterval(() => {
            // if (this.$element.querySelector('.translated-text')) {
            //     clearInterval(translationCheckInterval);
            // }
            helpers.translateRaw(this.state.type);
            console.log("Checking for translations...");
        }, 400);

        // Setup Google Translate handling
        const checkInterval = setInterval(helpers.checkForGoogleTranslate, 1000);
        window.addEventListener('load', helpers.checkForGoogleTranslate(checkInterval));

        // Attach observer to all translation elements
        document.querySelectorAll('.translation-text').forEach((textElement) => {
            helpers.observer.observe(textElement, {
                characterData: true,
                childList: true,
                subtree: true,
            });
        });

        // Start observing the document for dynamic changes
        helpers.documentObserver.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }


    useState(initialState) {
        this.state = initialState;
        const setState = (newState, callback) => {
            this.state = { ...this.state, ...newState };
            this.render();
            if (callback) callback();
        };
        return [this.state, setState];
    }

    setup() {
        this.state = {
            jsdata: [],
            loading: true,
            error: null,
            type: '', // default type
            complete: false,
        };
    }

    setEvent() {
        // you can add UI-related events here later
    }


    async fetchChapterImages() {
        try {
            // API
            const params = new URLSearchParams(window.location.search);
            const cid = params.get('cid');
            const mid = params.get('mid');

            const apiUrl = `${this.API_URL}/api/images/${this.mangaId}/${this.chapter}?cid=${cid}&mid=${mid}`;
            const apiUrlOcr = `${this.API_URL}/api/ocr`;
            console.log("📡 Fetching:", apiUrl);

            const res = await fetch(apiUrl, { method: "GET" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();

            console.log("🚀 Starting OCR request...");
            let imageData = data?.images?.map(item => item.img_url); // extract image URLs

            // HTML Scrape
            // const apiUrl = `${this.API_URL}/api/images/${this.mangaId}/${this.chapter}`;
            // const apiUrlOcr = `${this.API_URL}/api/ocr`;
            // console.log("📡 Fetching:", apiUrl);

            // const res = await fetch(apiUrl, { method: "GET" });
            // if (!res.ok) throw new Error(`HTTP ${res.status}`);
            // const data = await res.json();

            // console.log("🚀 Starting OCR request...");
            // let imageData = data.map(item => item.img_url); // extract image URLs


            const ocrResponse = await fetch(apiUrlOcr, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(imageData),
            });

            const ocrData = await ocrResponse.json();
            console.log("✅ OCR completed:", ocrData);
            // const ocrData = [{ "img_url": "_1.jpg", "translations": [{ "text": "第四百七十九话 .全都上来了", "bbox": [82, 46, 634, 100], "confidence": 0.8293900153631193, "verified": false }] }, { "img_url": "_2.jpg", "translations": [{ "text": "包子漫蜚", "bbox": [107, 31, 315, 93], "confidence": 0.22630971670150757, "verified": false }, { "text": "包子漫蜚", "bbox": [565, 33, 718, 83], "confidence": 0.17429092526435852, "verified": false }, { "text": "02@0", "bbox": [101, 83, 317, 119], "confidence": 0.000007411288152070483, "verified": false }, { "text": "本漫董由包子漫董收集整理。更多免囊漫董萧纺周", "bbox": [339, 103, 875, 139], "confidence": 0.000854745951938264, "verified": false }, { "text": "止3-督已", "bbox": [449, 139, 775, 177], "confidence": 6.707003820788241e-8, "verified": false }, { "text": "矢二", "bbox": [92, 308, 334, 334], "confidence": 0.017796714052181792, "verified": false }, { "text": "你看到前面的金色", "bbox": [283, 432, 556, 482], "confidence": 0.9787829258340587, "verified": false }, { "text": "海洋吗?  我们守在", "bbox": [284, 475, 555, 519], "confidence": 0.7934917641550916, "verified": false }, { "text": "这里。是想横渡这", "bbox": [285, 514, 556, 559], "confidence": 0.8374620925789886, "verified": false }, { "text": "片金色海洋。", "bbox": [283, 555, 473, 599], "confidence": 0.9860770940687055, "verified": false }, { "text": "这海洋中的火焰力", "bbox": [552, 586, 822, 630], "confidence": 0.8981198820994665, "verified": false }, { "text": "量极其可怕。只有", "bbox": [555, 627, 823, 671], "confidence": 0.8070367965608355, "verified": false }, { "text": "火系妖族操控七品", "bbox": [555, 665, 823, 709], "confidence": 0.9648218220091258, "verified": false }, { "text": "以上宝器方可渡过。", "bbox": [555, 705, 841, 749], "confidence": 0.9102639046427097, "verified": false }, { "text": "小子。〉小心", "bbox": [615, 1395, 823, 1439], "confidence": 0.1444546618335094, "verified": false }, { "text": "一点!", "bbox": [619, 1437, 703, 1477], "confidence": 0.9557396415332706, "verified": false }, { "text": "哦?  这火焰", "bbox": [347, 1595, 517, 1637], "confidence": 0.7226585735006251, "verified": false }, { "text": "很厉害吗?", "bbox": [345, 1633, 503, 1677], "confidence": 0.96557384717786, "verified": false }] }];
            this.setState({ jsdata: ocrData, loading: false, type: 'Manhua' }, () => this.addImages());
        } catch (err) {
            console.error("❌ Error fetching chapters:", err);
            this.setState({ error: err, loading: false });
        }
    }

    template() {
        if (this.state.loading) {
            return loader();
        }

        if (this.state.error) {
            return `<div class="error text-red-500 text-center">Failed to load chapters.</div>`;
        }
        const template = `
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
        // return template;
    }

    async addImages() {
        const { jsdata } = this.state;
        if (!Array.isArray(jsdata) || jsdata.length === 0) {
            console.warn("⚠️ No images found in state");
            return;
        }

        console.log(`🖼️ Loading ${jsdata.length} images...`);

        // Select existing image containers
        jsdata.forEach(async (item, i) => {

            // Set proper image URL
            const imgUrl =
                this.isProd || !item.img_url.startsWith("http")
                    ? `http://localhost:3000/images/${item.img_url}`
                    : item.img_url;

            const imageContainer = document.createElement("div");
            const imageContainerClass = "comic-image-container bg-gray-200 rounded-lg shadow-lg w-full max-w-6xl mx-auto";
            imageContainer.classList.add(...imageContainerClass.split(" "));
            imageContainer.style.position = "relative";

            this.$element.appendChild(imageContainer);

            // Load image with fade-in effect
            await helpers.reloadImage({
                imgUrl,
                imageContainer,
                imageData: item,
                onSuccess: (image, imageData) => {
                    const rawTranslations = Array.isArray(imageData?.translations)
                        ? imageData.translations
                        : [];
                    console.log("Raw Translations:", rawTranslations);
                    const normalized = rawTranslations.map(helpers.normalizeTranslation);
                    this.renderSpeechBubbles(imageContainer, image, normalized);
                    this.state.complete = true;
                },
            });
        });
        return true;
    }

    renderSpeechBubbles(container, image, translations) {
        if (!translations || translations.length === 0) return;

        // Group lines into bubbles
        const speechBubbles = helpers.groupLinesIntoSpeechBubbles(translations, 100, 30);
        if (!speechBubbles.length) return;

        const canvas = document.createElement('canvas');
        // --- Setup canvas to match the image's displayed (CSS) size with DPR handling ---
        const displayW = image.clientWidth;   // displayed width (CSS px)
        const displayH = image.clientHeight;  // displayed height (CSS px)
        const dpr = window.devicePixelRatio || 1;

        // configure high-DPI canvas but keep ctx coordinates as CSS px (via setTransform)
        canvas.width = Math.round(displayW * dpr);
        canvas.height = Math.round(displayH * dpr);
        canvas.style.width = displayW + 'px';
        canvas.style.height = displayH + 'px';

        const ctx = canvas.getContext('2d');
        // Map CSS pixels -> device pixels so we can draw using CSS coordinates
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // draw the image at displayed size (CSS px coordinates)
        ctx.clearRect(0, 0, displayW, displayH);
        ctx.drawImage(image, 0, 0, displayW, displayH);

        // scale factors from natural image coordinates -> displayed (CSS) coordinates
        const scaleX = displayW / image.naturalWidth;
        const scaleY = displayH / image.naturalHeight;

        // compute offsets if image does not fill its container (object-fit: contain, letterbox, etc.)
        const containerRect = container.getBoundingClientRect();
        const imageRect = image.getBoundingClientRect();
        const offsetX = Math.round(imageRect.left - containerRect.left);
        const offsetY = Math.round(imageRect.top - containerRect.top);

        // ensure the container is positioned relative so absolute children align
        // (if not already set in CSS)
        container.style.position = container.style.position || 'relative';

        // We'll collect overlay elements to append after canvas -> so they are above the canvas
        const overlays = [];

        for (const bubble of speechBubbles) {
            const mergedText = bubble.map(line => line.text).join(' ');
            const minX = Math.min(...bubble.map(line => line.bbox.x0));
            const minY = Math.min(...bubble.map(line => line.bbox.y0));
            const maxX = Math.max(...bubble.map(line => line.bbox.x1));
            const maxY = Math.max(...bubble.map(line => line.bbox.y1));
            const bbox = { x0: minX, y0: minY, x1: maxX, y1: maxY };

            // style props (safe defaults)
            // pick style props from first line in bubble (safe defaults)
            const first = bubble[0] || {};
            const fg_color = first.fg_color ?? [0, 0, 0];
            const bg_color = first.bg_color ?? [255, 255, 255];
            const angle = first.angle ?? 0;
            const type = first.type ?? 'inside';
            const is_bold = first.is_bold ?? false;

            const fg_color_rgb = helpers.arrayToRgb(fg_color);
            const bg_color_rgb = helpers.arrayToRgb(bg_color);

            // Convert bbox to displayed (CSS) coords
            const leftCss = bbox.x0 * scaleX;
            const topCss = bbox.y0 * scaleY;
            const rightCss = bbox.x1 * scaleX;
            const bottomCss = bbox.y1 * scaleY;

            const bubbleWidth = Math.max(8, rightCss - leftCss);
            const bubbleHeight = Math.max(8, bottomCss - topCss);

            // padding in CSS px (tweak as needed)
            const padding = 0;

            // center used for rotation alignment (CSS coords relative to imageContainer)
            const centerX = offsetX + leftCss + bubbleWidth / 2;
            const centerY = offsetY + topCss + bubbleHeight / 2;

            // proceed to next bubble if confidence is low 0.3
            // get bubble confidence using map
            // console.log("Processing bubble:", bubble[0]);
            // let bubbleConfidence = Math.round(bubble[0].confidence * 1000) / 1000;
            // let roundedStr = bubbleConfidence.toFixed(3);
            // console.log("Bubble confidence:", roundedStr);
            // if (roundedStr > 0.03) {



            if (mergedText.length > 2) {
                // --- draw the inpaint / background on the canvas ---
                // We must draw using the SAME CSS coordinates. Because ctx.setTransform maps CSS -> device,
                // we can use CSS coords directly here (no extra multiplication by dpr).
                ctx.save();
                // translate to the center of the bubble (canvas coordinates are CSS px because of setTransform)
                ctx.translate(leftCss + bubbleWidth / 2, topCss + bubbleHeight / 2);
                if (angle) ctx.rotate((angle * Math.PI) / 180); // rotate around the same center
                ctx.fillStyle = bg_color_rgb || 'rgb(255,255,255)';
                ctx.fillRect(
                    -bubbleWidth / 2 - padding,
                    -bubbleHeight / 2 - padding,
                    bubbleWidth + padding * 2,
                    bubbleHeight + padding * 2
                );
                ctx.restore();
            }

            if (type === "sfx") {
                const sfxContainer = document.createElement("div");
                sfxContainer.className = "sfx-container";
                sfxContainer.style.position = "absolute";
                sfxContainer.style.left = centerX + "px";
                sfxContainer.style.top = centerY + "px";
                sfxContainer.style.width = `${bubbleWidth + padding * 2}px`;
                sfxContainer.style.height = `${bubbleHeight + padding * 2}px`;
                sfxContainer.style.transform = `translate(-50%,-50%) rotate(${angle}deg)`;
                sfxContainer.style.transformOrigin = "center center";
                sfxContainer.style.overflow = "visible";
                sfxContainer.style.zIndex = 999;
                overlays.push(sfxContainer);
                helpers.makeDraggable(sfxContainer);
            } else {
                const translationText = document.createElement("div");
                translationText.classList.add("translation-text");
                translationText.dataset.fr = bubble[0]?.fr ?? "";
                translationText.dataset.en = bubble[0]?.en ?? "";
                translationText.dataset.pt = bubble[0]?.pt ?? "";
                translationText.style.position = "absolute";
                translationText.style.left = centerX + "px";
                translationText.style.top = centerY + "px";
                translationText.style.width = `${bubbleWidth + padding * 2}px`;
                translationText.style.height = `${bubbleHeight + padding * 2}px`;
                translationText.style.display = "grid";
                translationText.style.placeItems = "center";
                translationText.style.textAlign = "center";
                translationText.style.userSelect = "text";
                translationText.style.pointerEvents = "auto";
                translationText.style.transform = `translate(-50%,-50%) rotate(${angle}deg)`;
                translationText.style.transformOrigin = "center center";
                translationText.style.fontFamily = is_bold ? "blambot-bold" : "blambot";
                translationText.style.zIndex = 999;

                overlays.push(translationText);
                // let external logic resize the text box (refitTextBox)
                helpers.refitTextBox(translationText);
                translationText.innerHTML = helpers.formatText(mergedText);
                helpers.makeDraggable(translationText);
                helpers.attachEditableTooltip(translationText, mergedText);
            }
        } // end for each bubble

        // After drawing all backgrounds, update the image with the canvas result (inpainted look)
        try {
            const translatedImageUrl = canvas.toDataURL("image/jpeg", 0.95);
            image.src = translatedImageUrl;
            image.setAttribute("isPainted", "1");
        } catch (e) {
            console.warn("Could not replace image src with canvas data:", e);
        }

        // Append overlays (they will sit above canvas because zIndex is higher)
        overlays.forEach((el) => container.appendChild(el));
    }
}
