const API_URL = import.meta.env.VITE_API_URL;
const isProd = process.env.NODE_ENV === "production";


const comicType = document
    .getElementById('comic-type')
    .textContent.trim('\n')
    .trim(' ');

let jsdata = [];

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const urlParams = window.location.href.split("/");
        const slot = urlParams.pop().split(".html")[0].split("_");
        const chapterSlot = slot[1];
        const sectionSlot = slot[0];
        const comicId = urlParams.pop();

        const apiUrl = `${API_URL}/api/images/${comicId}/${sectionSlot}/${chapterSlot}`;
        const apiUrlOcr = `${API_URL}/api/ocr`;

        const response = await fetch(apiUrl);
        const data = await response.json();
        jsdata = data;

        console.log("Fetched images:", data);
        await addImage(); // waits for all images to finish loading

        console.log("🚀 Starting OCR request...");
        let imageData = jsdata.map(item => item.img_url); // extract image URLs
        const ocrResponse = await fetch(apiUrlOcr, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(imageData),
        });

        const ocrData = await ocrResponse.json();
        console.log("✅ OCR completed:", ocrData);

        jsdata = ocrData;
        await addImage(); // now render with OCR
    } catch (error) {
        console.error("❌ Error:", error);
    }
});


// const jsdata = JSON.parse(document.getElementById('json-data').textContent);

const comicContainer = document.getElementById('comic-container'),
    comicImagesContainer = document.getElementById('comic-images-container');

function fitTextToBox(
    textElement,
    textContent,
    boxWidth,
    boxHeight,
    minFontSize = 3
) {
    let fontSize = 100;
    textElement.style.fontSize = fontSize + 'px';
    textElement.textContent = textContent;

    while (
        (textElement.scrollWidth > boxWidth || textElement.scrollHeight > boxHeight) &&
        fontSize > minFontSize
    ) {
        fontSize--;
        textElement.style.fontSize = fontSize + 'px';
    }

    const lineHeight = Math.max(0.5, boxHeight / textElement.scrollHeight);
    textElement.style.lineHeight = '' + lineHeight;

    if (textElement.scrollWidth > boxWidth || textElement.scrollHeight > boxHeight) {
        textElement.style.display = 'flex';
        textElement.style.justifyContent = 'center';
        textElement.style.alignItems = 'center';
        textElement.style.overflow = 'visible';
    }

    return fontSize;
}

function isNewFormat(data) {
    let translation = data[0].translations[0];
    return translation.fg_color !== undefined;
}

let currentIndex = 0;

function arrayToRgb(array) {
    return 'rgb(' + array[0] + ', ' + array[1] + ', ' + array[2] + ')';
}

function formatText(text) {
    // text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // text = text.replace(/\n/g, '<br>');
    return text.toUpperCase();
}

// ---------- Helpers (put these near top-level of script.js) ----------

/**
 * Normalize one translation item into a consistent shape:
 * { bbox: { x0,y0,x1,y1 }, text, fg_color, bg_color, angle, type, is_bold, ... }
 */
function normalizeTranslation(t) {
    // If t is an array like [bboxArray, text]
    if (Array.isArray(t) && t.length >= 2) {
        const b = t[0];
        const txt = t[1] ?? "";
        if (Array.isArray(b) && b.length >= 4) {
            return {
                ...t,
                bbox: { x0: b[0], y0: b[1], x1: b[2], y1: b[3] },
                text: String(txt),
            };
        }
        return { bbox: { x0: 0, y0: 0, x1: 0, y1: 0 }, text: String(txt) };
    }

    // If t is an object with bbox array or object
    let bbox = t.bbox;
    if (Array.isArray(bbox) && bbox.length >= 4) {
        bbox = { x0: bbox[0], y0: bbox[1], x1: bbox[2], y1: bbox[3] };
    } else if (!bbox || typeof bbox !== "object") {
        bbox = { x0: 0, y0: 0, x1: 0, y1: 0 };
    }
    const text = t.text ?? t.en ?? t.fr ?? t.pt ?? "";
    return {
        ...t,
        bbox,
        text: String(text),
        fg_color: t.fg_color ?? [0, 0, 0],
        bg_color: t.bg_color ?? [255, 255, 255],
        angle: t.angle ?? 0,
        type: t.type ?? "inside",
        is_bold: !!t.is_bold,
    };
}

/**
 * Group lines into speech-bubbles. Uses spatial heuristics.
 * Returns an array of bubbles, each bubble is an array of normalized lines.
 */
function groupLinesIntoSpeechBubbles(translations, verticalThreshold = 100, horizontalThreshold = 30) {
    const speechBubbles = [];
    translations.forEach((currentLine) => {
        let addedToBubble = false;
        for (const bubble of speechBubbles) {
            const lastLine = bubble[bubble.length - 1];
            if (!lastLine || !lastLine.bbox || !currentLine.bbox) continue;

            const isCloseVertically = Math.abs(currentLine.bbox.y0 - lastLine.bbox.y0) < verticalThreshold;
            const isCloseHorizontally = Math.abs(currentLine.bbox.x0 - lastLine.bbox.x0) < horizontalThreshold;

            if (isCloseVertically && isCloseHorizontally) {
                bubble.push(currentLine);
                addedToBubble = true;
                break;
            }
        }
        if (!addedToBubble) {
            speechBubbles.push([currentLine]);
        }
    });
    return speechBubbles;
}

/**
 * Create simple double-click editable tooltip inside translation overlay
 */
function attachEditableTooltip(overlayEl, initialText) {
    overlayEl.title = initialText; // native tooltip on hover
    overlayEl.dataset.originalText = initialText;

    overlayEl.addEventListener("dblclick", () => {
        if (overlayEl._editing) return;
        overlayEl._editing = true;

        const input = document.createElement("textarea");
        input.className = "translation-editor";
        input.value = overlayEl.textContent || "";
        input.style.width = "100%";
        input.style.height = "100%";
        input.style.boxSizing = "border-box";
        input.style.resize = "none";
        input.style.fontFamily = overlayEl.style.fontFamily || "inherit";
        input.style.fontSize = overlayEl.style.fontSize || "inherit";
        input.style.lineHeight = overlayEl.style.lineHeight || "inherit";

        // Replace overlay contents with input
        overlayEl.innerHTML = "";
        overlayEl.appendChild(input);
        input.focus();

        function finishEdit() {
            const newText = input.value;
            overlayEl.innerHTML = formatText(newText);
            overlayEl._editing = false;
            refitTextBox(overlayEl);
        }

        input.addEventListener("blur", finishEdit);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                overlayEl.innerHTML = formatText(overlayEl.dataset.originalText || "");
                overlayEl._editing = false;
                refitTextBox(overlayEl);
            } else if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                finishEdit();
            }
        });
    });
}

/**
 * Render speech bubbles: draws inpaint/background rectangles on a high-DPI canvas
 * and creates overlay text boxes positioned/rotated to match the bubble.
 *
 * container: imageContainer element (position: relative)
 * image: the loaded <img> element (displayed at CSS size)
 * translations: array of normalized translation objects
 */
function renderSpeechBubbles(container, image, translations) {
    if (!translations || translations.length === 0) return;

    // Group lines into bubbles
    const speechBubbles = groupLinesIntoSpeechBubbles(translations, 100, 30);
    if (!speechBubbles.length) return;

    // Get displayed size and DPR
    const displayW = image.clientWidth || image.width;
    const displayH = image.clientHeight || image.height;
    const dpr = window.devicePixelRatio || 1;

    // Create canvas sized for displayed area but with device pixel density
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(displayW * dpr);
    canvas.height = Math.round(displayH * dpr);
    canvas.style.width = displayW + "px";
    canvas.style.height = displayH + "px";
    canvas.style.position = "absolute";
    canvas.style.left = "0px";
    canvas.style.top = "0px";
    canvas.style.zIndex = "1"; // behind overlays (overlay will use zIndex 999)
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    // Map CSS px coordinates to device pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Draw the current image onto canvas at displayed size (CSS coords)
    ctx.clearRect(0, 0, displayW, displayH);
    try {
        ctx.drawImage(image, 0, 0, displayW, displayH);
    } catch (e) {
        // If drawImage fails (rare), skip inpainting
        console.warn("drawImage failed:", e);
    }

    // Scale factors from natural image coords -> displayed (CSS) coords
    // If naturalWidth is zero, fallback to 1 to avoid division by zero
    const naturalW = image.naturalWidth || 1;
    const naturalH = image.naturalHeight || 1;
    const scaleX = displayW / naturalW;
    const scaleY = displayH / naturalH;

    // Container & image offsets so overlays align when container has padding/margins
    const containerRect = container.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    const offsetX = Math.round(imageRect.left - containerRect.left);
    const offsetY = Math.round(imageRect.top - containerRect.top);

    // We'll collect overlay elements to append after canvas -> so they are above the canvas
    const overlays = [];

    for (const bubble of speechBubbles) {
        const mergedText = bubble.map((line) => line.text).join(" ").trim();
        if (!mergedText || mergedText.length <= 2) {
            // skip very short lines (likely noise)
            continue;
        }

        // Compute bounding box (natural coords) from lines
        const minX = Math.min(...bubble.map((l) => l.bbox.x0));
        const minY = Math.min(...bubble.map((l) => l.bbox.y0));
        const maxX = Math.max(...bubble.map((l) => l.bbox.x1));
        const maxY = Math.max(...bubble.map((l) => l.bbox.y1));
        const bbox = { x0: minX, y0: minY, x1: maxX, y1: maxY };

        // Map to displayed (CSS) coordinates
        const leftCss = bbox.x0 * scaleX;
        const topCss = bbox.y0 * scaleY;
        const rightCss = bbox.x1 * scaleX;
        const bottomCss = bbox.y1 * scaleY;
        const bubbleWidth = Math.max(8, rightCss - leftCss);
        const bubbleHeight = Math.max(8, bottomCss - topCss);

        // style props from first line
        const first = bubble[0] || {};
        const fg_color = first.fg_color ?? [0, 0, 0];
        const bg_color = first.bg_color ?? [255, 255, 255];
        const fg_color_rgb = arrayToRgb(fg_color);
        const bg_color_rgb = arrayToRgb(bg_color);
        const angle = first.angle ?? 0;
        const type = first.type ?? "inside";
        const is_bold = first.is_bold ?? false;

        // Draw rectangle (background) on canvas — translate/rotate around center
        ctx.save();
        // Translate to the rectangle center (CSS coords)
        ctx.translate(leftCss + bubbleWidth / 2, topCss + bubbleHeight / 2);
        if (angle) ctx.rotate((angle * Math.PI) / 180);
        ctx.fillStyle = bg_color_rgb || "rgb(255,255,255)";
        // padding to avoid cutting edges
        const padding = 2;
        ctx.fillRect(-bubbleWidth / 2 - padding, -bubbleHeight / 2 - padding, bubbleWidth + padding * 2, bubbleHeight + padding * 2);
        ctx.restore();

        // Create overlay DIV (text or sfx)
        const centerX = offsetX + leftCss + bubbleWidth / 2;
        const centerY = offsetY + topCss + bubbleHeight / 2;

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
            makeDraggable(sfxContainer);
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
            translationText.innerHTML = formatText(mergedText);
            translationText.dataset.bbox = JSON.stringify([bbox.x0, bbox.y0, bbox.x1, bbox.y1]);

            // optional debug outline (remove when not needed)
            if (window.DEBUG_BBOX) {
                translationText.style.outline = "1px dashed rgba(0,0,0,0.2)";
            }

            overlays.push(translationText);
            attachEditableTooltip(translationText, mergedText);
            makeDraggable(translationText);
            // let external logic resize the text box (refitTextBox)
            refitTextBox(translationText);
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

// ---------- Image loader & addImage (use the helpers above) ----------

/**
 * Loads a single image into the specified container, processes translations (if any),
 * draws canvas backgrounds, creates overlays. Returns a Promise that resolves when done.
 */
function loadImage(imgUrl, imageContainer, imageData, maxRetries = 3) {
    return new Promise((resolve) => {
        const image = new Image();
        const imageClass = "w-full shadow-md object-contain";
        image.classList.add(...imageClass.split(" "));
        image.style.display = "none";

        let retryCount = 0;

        function tryLoad() {
            image.src = imgUrl;
            console.log(`🌀 Loading image: ${imgUrl}`);

            image.onload = () => {
                // Append the raw image (we may replace its src later after canvas drawing)
                imageContainer.appendChild(image);
                image.style.display = "block";

                // Normalize translations and render speech bubbles (including canvas drawing)
                const rawTranslations = Array.isArray(imageData?.translations) ? imageData.translations : [];
                const normalized = rawTranslations.map(normalizeTranslation);

                // Render bubbles & overlays (this will draw canvas and replace image.src accordingly)
                renderSpeechBubbles(imageContainer, image, normalized);

                // done
                resolve(true);
            };

            image.onerror = () => {
                if (retryCount < maxRetries) {
                    retryCount++;
                    console.warn(`⚠️ Retry ${retryCount} for ${imgUrl}`);
                    setTimeout(tryLoad, 1500);
                } else {
                    console.error(`❌ Failed to load image: ${imgUrl}`);
                    const spinner = imageContainer.querySelector(".loading-spinner");
                    if (spinner) spinner.remove();
                    resolve(false);
                }
            };
        }

        tryLoad();
    });
}

/**
 * Main addImage — sequentially loads every image in jsdata and processes OCR overlays.
 */
async function addImage() {
    if (!jsdata || jsdata.length === 0) {
        console.warn("⚠️ No images found in jsdata");
        return false;
    }

    const total = jsdata.length;
    console.log(`🖼️ Loading ${total} images...`);
    comicImagesContainer.innerHTML = "";

    for (let i = 0; i < total; i++) {
        const imageData = jsdata[i];
        const imgUrl = isProd ? `http://localhost:3000/images/${imageData.img_url}` : imageData.img_url;

        // build container + spinner
        const imageContainer = document.createElement("div");
        const imageContainerClass = "comic-image-container bg-gray-200 rounded-lg shadow-lg px-6 w-full max-w-6xl mx-auto";
        imageContainer.classList.add(...imageContainerClass.split(" "));
        imageContainer.style.position = "relative";

        const loadingSpinner = document.createElement("div");
        loadingSpinner.classList.add("loading-spinner");
        imageContainer.appendChild(loadingSpinner);
        comicImagesContainer.appendChild(imageContainer);

        // Wait until this image loads and overlays are rendered
        await loadImage(imgUrl, imageContainer, imageData);
    }

    console.log("✅ All images loaded and rendered!");
    return true;
}



function makeDraggable(element) {
    let pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = element.offsetTop - pos2 + 'px';
        element.style.left = element.offsetLeft - pos1 + 'px';
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function detectGoogleTranslate() {
    if (
        document.documentElement.classList.contains('translated-ltr') ||
        document.documentElement.classList.contains('translated-rtl')
    ) {
        return true;
    }
    if (
        window.location.href.indexOf('translate.google') !== -1 ||
        window.location.href.indexOf('translate_c?') !== -1
    ) {
        return true;
    }
    if (
        document.getElementById('google_translate_element') ||
        document.getElementsByClassName('goog-te-banner-frame').length > 0
    ) {
        return true;
    }
    return false;
}

function isRaw(text) {
    if (comicType === 'Manhwa') {
        return /[\uAC00-\uD7A3]/gu.test(text);
    } else if (comicType === 'Manhua') {
        return /[\u4E00-\u9FFF]/gu.test(text);
    }
}

const fetchTranslate = async (text, targetLanguage = 'en') => {
    const requestData = [[text, 'auto', targetLanguage], 'te'],
        xhr = new XMLHttpRequest();
    xhr.open(
        'POST',
        'https://translate-pa.googleapis.com/v1/translateHtml',
        true
    );
    xhr.setRequestHeader('content-type', 'application/json+protobuf');
    xhr.setRequestHeader(
        'x-goog-api-key',
        'AIzaSyATBXajvzQLTDHEQbcpq0Ihe0vWDHmO520'
    );
    xhr.send(JSON.stringify(requestData));
    return new Promise((resolve, reject) => {
        xhr.onload = () => {
            try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
            } catch (error) {
                console.error('Error when translation:', error);
                resolve(null);
            }
        };
        xhr.onerror = () => {
            console.error('Error when translation requests.');
            resolve(null);
        };
    });
};

function onGoogleTranslate() {
    console.log('Google Translate detected!');
    gtag('event', 'gtrad_lang', {
        target_language: document.documentElement.lang,
    });
}

function translateRaw() {
    let elementsToTranslate = document.querySelectorAll(
        '.translation-text, .sfx-text, p, h1, h2, h3, h4, h5, h6, a, span, li, td, th'
    );
    elementsToTranslate.forEach(async (element) => {
        if (element.innerHTML.trim() !== '' && isRaw(element.innerHTML)) {
            const isTranslationText = element.classList.contains('translation-text'),
                elementWidth = isTranslationText ? element.offsetWidth : null,
                elementHeight = isTranslationText ? element.offsetHeight : null,
                translatedText = await fetchTranslate([element.innerHTML], 'en');
            if (element.classList.contains('sfx-text')) {
                element.style.display = 'none';
            } else {
                if (translatedText && translatedText[0] && translatedText[0].length > 0) {
                    element.innerHTML = translatedText[0][0];
                    element.classList.remove('translation-text');
                    element.classList.add('translated-text');
                }
            }
        }
    });
}

setInterval(translateRaw, 400);

const textBoxCache = new WeakMap();

function refitTextBox(element) {
    if (document.documentElement.lang === 'ar') return;

    if (element.textContent.trim()) {
        const width = element.offsetWidth;
        const height = element.offsetHeight;
        const textContent = element.textContent;
        const cacheData = textBoxCache.get(element) || { changeCount: 0 };

        if (cacheData.changeCount >= 3) return;

        if (
            cacheData.width !== width ||
            cacheData.height !== height ||
            cacheData.text !== textContent
        ) {
            const changeCount = (cacheData.changeCount || 0) + 1;
            const fontSize = fitTextToBox(element, textContent, width, height);
            element.style.fontSize = `${fontSize}px`;

            textBoxCache.set(element, {
                width,
                height,
                text: textContent,
                fontSize,
                changeCount,
            });
        }
    }
}

// Observe text changes for resizing
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        let targetElement = null;

        if (mutation.target.nodeType === Node.ELEMENT_NODE) {
            targetElement = mutation.target.classList?.contains('translated-text')
                ? mutation.target
                : mutation.target.closest('.translation-text');
        } else {
            targetElement = mutation.target.parentElement?.closest('.translated-text');
        }
        targetElement.classList.remove('translated-text');
        targetElement.classList.add('mutating-text');
        targetElement.classList.add('translation-text');

        if (targetElement) {
            targetElement.classList.remove('mutating-text');
            targetElement.classList.remove('translation-text');
            targetElement.classList.add('translated-text');
            refitTextBox(targetElement);
        }
    });
});

// Attach observer to all translation elements
document.querySelectorAll('.translation-text').forEach((textElement) => {
    observer.observe(textElement, {
        characterData: true,
        childList: true,
        subtree: true,
    });
});

// Observe new elements added dynamically
const documentObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((newNode) => {
            if (newNode.nodeType === 1) {
                if (newNode.classList.contains('translation-text')) {
                    observer.observe(newNode, { characterData: true, childList: true, subtree: true });
                }
                newNode.querySelectorAll('.translation-text').forEach((nestedText) => {
                    observer.observe(nestedText, { characterData: true, childList: true, subtree: true });
                });
            }
        });
    });
});

// Start observing the document for dynamic changes
documentObserver.observe(document.body, {
    childList: true,
    subtree: true,
});

// Check for Google Translate periodically
function checkForGoogleTranslate() {
    if (detectGoogleTranslate()) {
        onGoogleTranslate();
        clearInterval(checkInterval);
    }
}

const checkInterval = setInterval(checkForGoogleTranslate, 1000);
window.addEventListener('load', checkForGoogleTranslate);

window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());

gtag('config', 'G-6XJW3RQBS1');