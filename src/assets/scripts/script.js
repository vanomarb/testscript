const API_URL = import.meta.env.VITE_API_URL;
const isProd = process.env.NODE_ENV === "production";


const comicType = document
    .getElementById('comic-type')
    .textContent.trim('\n')
    .trim(' ');

const comicContainer = document.getElementById('comic-container'),
    comicImagesContainer = document.getElementById
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
        //  image = await loadImageWithProxy(image.src);

        // intecept ocrData img_url to proxy images through our server
        // jsdata = ocrData.map(item => {
        //     if (item.img_url.startsWith("http") && !isProd) {
        //         item.img_url = `${API_URL}/api/proxy?url=${encodeURIComponent(item.img_url)}`;
        //     } else if (!isProd) {
        //         item.img_url = `http://localhost:3000/images/${item.img_url}`;
        //     }
        // });
        // console.log("Updated jsdata with proxied URLs:", jsdata);
        jsdata = ocrData;
        await addImage(); // now render with OCR
    } catch (error) {
        console.error("❌ Error:", error);
    }
});


// const jsdata = JSON.parse(document.getElementById('json-data').textContent);


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
    // If t is an array [bboxArray, text], convert it
    if (Array.isArray(t)) {
        const [b, txt] = t;
        if (Array.isArray(b) && b.length >= 4) {
            return { ...t, bbox: { x0: b[0], y0: b[1], x1: b[2], y1: b[3] }, text: txt };
        }
        return { bbox: { x0: 0, y0: 0, x1: 0, y1: 0 }, text: String(txt) };
    }

    // If bbox is an array, convert to object
    let bbox = t.bbox;
    if (Array.isArray(bbox)) {
        bbox = { x0: bbox[0], y0: bbox[1], x1: bbox[2], y1: bbox[3] };
    } else if (!bbox || typeof bbox !== 'object') {
        bbox = { x0: 0, y0: 0, x1: 0, y1: 0 };
    }

    const text = t.text ?? t.en ?? t.fr ?? t.pt ?? '';

    return { ...t, bbox, text };
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

async function loadImageWithProxy(originalUrl) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous";

        // ✅ Load through your proxy FIRST
        const proxiedUrl = `${API_URL}/api/proxy?url=${encodeURIComponent(originalUrl)}`;
        image.src = proxiedUrl;

        image.onload = () => resolve(image);
        image.onerror = reject;
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
async function renderSpeechBubbles(container, image, translations) {
    if (!translations || translations.length === 0) return;

    // Group lines into bubbles
    const speechBubbles = groupLinesIntoSpeechBubbles(translations, 100, 30);
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

        const fg_color_rgb = arrayToRgb(fg_color);
        const bg_color_rgb = arrayToRgb(bg_color);

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

            overlays.push(translationText);
            // let external logic resize the text box (refitTextBox)
            refitTextBox(translationText);
            translationText.innerHTML = formatText(mergedText);
            makeDraggable(translationText);
            attachEditableTooltip(translationText, mergedText);
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
        let image = new Image();
        image.crossOrigin = "anonymous";
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
                if (image.getAttribute('isPainted') === '1') return;
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
        const imgUrl = isProd || !imageData.img_url.startsWith("http") ? `http://localhost:3000/images/${imageData.img_url}` : imageData.img_url;

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