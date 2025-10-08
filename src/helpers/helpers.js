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

function arrayToRgb(array) {
    return 'rgb(' + array[0] + ', ' + array[1] + ', ' + array[2] + ')';
}

function formatText(text) {
    // text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // text = text.replace(/\n/g, '<br>');
    return text.toUpperCase();
}

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

function reloadImage({ imgUrl, imageContainer, imageData, maxRetries = 3, onSuccess, onFail }) {
    return new Promise((resolve) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.className = "w-full shadow-md object-contain";
        image.style.display = "none";

        const tryLoad = (attempt = 0) => {
            image.src = imgUrl;
            console.log(`🌀 Loading image: ${imgUrl}`);

            image.onload = () => {
                image.style.display = "block";
                imageContainer.appendChild(image);
                if (image.getAttribute('isPainted') === '1') return;
                onSuccess?.(image, imageData);
                resolve(true);
            };

            image.onerror = () => {
                if (attempt < maxRetries) {
                    console.warn(`⚠️ Retry ${attempt + 1}/${maxRetries} for ${imgUrl}`);
                    setTimeout(() => tryLoad(attempt + 1), 1500);
                } else {
                    onFail?.(imageUrl);
                    resolve(false);
                }
            };
        };

        tryLoad();
    });
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

function isRaw(text, comicType) {
    if (comicType === 'Manhwa') {
        return /[\uAC00-\uD7A3]/gu.test(text);
    } else if (comicType === 'Manhua') {
        return /[\u4E00-\u9FFF]/gu.test(text);
    } else if (comicType === 'Manga') {
        return /[\u3040-\u30FF\u31F0-\u31FF]/gu.test(text);
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

function translateRaw(comicType) {
    let elementsToTranslate = document.querySelectorAll(
        '.translation-text, .sfx-text, p, h1, h2, h3, h4, h5, h6, a, span, li, td, th'
    );
    elementsToTranslate.forEach(async (element) => {
        if (element.innerHTML.trim() !== '' && isRaw(element.innerHTML, comicType)) {
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

// Check for Google Translate periodically
function checkForGoogleTranslate(checkInterval) {
    if (detectGoogleTranslate()) {
        onGoogleTranslate();
        clearInterval(checkInterval);
    }
}

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

const helpers = {
    refitTextBox,
    fitTextToBox,
    arrayToRgb,
    formatText,
    normalizeTranslation,
    groupLinesIntoSpeechBubbles,
    attachEditableTooltip,
    reloadImage,
    makeDraggable,
    detectGoogleTranslate,
    onGoogleTranslate,
    translateRaw,
    fetchTranslate,
    isRaw,
    checkForGoogleTranslate,
    observer,
    documentObserver
}

export default helpers;