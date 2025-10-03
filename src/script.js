const comicType = document
    .getElementById('comic-type')
    .textContent.trim('\n')
    .trim(' ');

document.addEventListener('DOMContentLoaded', function () {
    // const chapterSelect = document.getElementById('chapter-select');
    // chapterSelect.addEventListener('change', function () {
    //     const selectedValue = this.value;
    //     if (selectedValue) {
    //         window.location.href = selectedValue;
    //     }
    // });

    // const decreaseSizeButton = document.getElementById('decrease-size'),
    //     increaseSizeButton = document.getElementById('increase-size'),
    //     comicImagesContainer = document.getElementById('comic-images-container');

    // let scale = 1;

    // function updateScale() {
    //     comicImagesContainer.style.transform = 'scale(' + scale + ')';
    //     comicImagesContainer.style.transformOrigin = 'top center';
    // }

    // decreaseSizeButton.addEventListener('click', function () {
    //     if (scale > 0.5) {
    //         scale -= 0.1;
    //         updateScale();
    //     }
    // });

    // increaseSizeButton.addEventListener('click', function () {
    //     if (scale < 2) {
    //         scale += 0.1;
    //         updateScale();
    //     }
    // });
});

const jsdata = JSON.parse(document.getElementById('json-data').textContent);

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

function addImage() {
    if (currentIndex >= jsdata.length) {
        return;
    }

    const imageData = jsdata[currentIndex],
        imageContainer = document.createElement('div');
    const imageContainerClass = "comic-image-container bg-gray-200 rounded-lg shadow-lg px-6 w-full max-w-6xl";
    imageContainer.classList.add(...imageContainerClass.split(' '));
    imageContainer.style.position = 'relative';

    const loadingSpinner = document.createElement('div');
    loadingSpinner.classList.add('loading-spinner');
    imageContainer.appendChild(loadingSpinner);
    comicImagesContainer.appendChild(imageContainer);

    const image = new Image();
    image.alt = 'Chapter Image';
    const imageClass = "w-full shadow-md w-full h-full object-contain";
    image.classList.add(...imageClass.split(' '), `comic-image-${currentIndex}`);
    image.style.display = 'none';

    let retryCount = 0;

    function loadImage() {
        const devmode = false;
        if (devmode) {
            image.src = 'http://127.0.0.1:5000/devimg.png';
            return;
        } else {
            image.src = 'http://localhost:3000/' + imageData.img_url;
        }

        image.onload = () => {
            loadingSpinner.remove();
            image.style.display = 'block';
            imageContainer.appendChild(image);

            // --- helpers ---
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

            // --- normalize translations safely ---
            const rawTranslations = Array.isArray(imageData?.translations) ? imageData.translations : [];
            const translations = rawTranslations.map(normalizeTranslation);

            // --- group into bubbles (NO double-loop over imageData.translations) ---
            const speechBubbles = groupLinesIntoSpeechBubbles(translations, 100, 30);

            // --- render one element per bubble ---
            speechBubbles.forEach((bubble) => {
                // merge text (use space; change to '\n' if you prefer line breaks)
                const mergedText = bubble.map(line => line.text).join(' ');

                const minX = Math.min(...bubble.map(line => line.bbox.x0));
                const minY = Math.min(...bubble.map(line => line.bbox.y0));
                const maxX = Math.max(...bubble.map(line => line.bbox.x1));
                const maxY = Math.max(...bubble.map(line => line.bbox.y1));
                const bbox = { x0: minX, y0: minY, x1: maxX, y1: maxY };

                // pick style props from first line in bubble (safe defaults)
                const first = bubble[0] || {};
                const fg_color = first.fg_color ?? [0, 0, 0];
                const bg_color = first.bg_color ?? [255, 255, 255];
                const angle = first.angle ?? 0;
                const type = first.type ?? 'inside';
                const is_bold = first.is_bold ?? false;

                const fg_color_rgb = arrayToRgb(fg_color);
                const bg_color_rgb = arrayToRgb(bg_color);

                const left = bbox.x0, top = bbox.y0, right = bbox.x1, bottom = bbox.y1;
                const scaleX = image.clientWidth / image.naturalWidth;
                const scaleY = image.clientHeight / image.naturalHeight;
                const width = Math.max(8, (right - left) * scaleX);
                const height = Math.max(8, (bottom - top) * scaleY);

                if (type === 'sfx') {
                    // keep your sfx SVG logic (trimmed for brevity; use your existing markup)
                    const sfxContainer = document.createElement('div');
                    sfxContainer.style.position = 'absolute';
                    sfxContainer.style.left = left * scaleX + 'px';
                    sfxContainer.style.top = top * scaleY + 'px';
                    sfxContainer.style.width = width + 'px';
                    sfxContainer.style.height = height + 'px';
                    sfxContainer.style.overflow = 'visible';
                    sfxContainer.style.transform = `rotate(${angle}deg)`;
                    sfxContainer.style.transformOrigin = 'center center';

                    const svgWidth = Math.max(300, mergedText.length * 20),
                        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg.setAttribute('viewBox', `0 0 ${svgWidth} 150`);
                    svg.style.width = '100%';
                    svg.style.height = '100%';
                    // insert your full SVG innerHTML here (kept short)
                    svg.innerHTML = `...`;
                    sfxContainer.appendChild(svg);
                    imageContainer.appendChild(sfxContainer);
                    makeDraggable(sfxContainer);
                } else {
                    const translationText = document.createElement('div');
                    translationText.classList.add('translation-text');
                    translationText.dataset.fr = bubble[0]?.fr ?? '';
                    translationText.dataset.en = bubble[0]?.en ?? '';
                    translationText.dataset.pt = bubble[0]?.pt ?? '';
                    translationText.innerHTML = formatText(mergedText);
                    translationText.style.position = 'absolute';
                    translationText.style.left = left * scaleX + 'px';
                    translationText.style.top = top * scaleY + 'px';
                    translationText.style.width = width + 'px';
                    translationText.style.height = height + 'px';
                    translationText.style.display = 'grid';
                    translationText.style.placeItems = 'center';
                    translationText.style.textAlign = 'center';
                    translationText.style.transform = `rotate(${angle}deg)`;
                    translationText.style.userSelect = 'text';
                    translationText.style.fontFamily = is_bold ? 'normalfont' : 'normalfont';
                    translationText.style.pointerEvents = 'auto';
                    translationText.classList.add('draggable-text');

                    imageContainer.appendChild(translationText);

                    // const fittedFontSize = fitTextToBox(
                    //     translationText,
                    //     mergedText,
                    //     width,
                    //     height
                    // );
                    refitTextBox(translationText);
                    // translationText.style.fontSize = fittedFontSize + 'px';
                    translationText.innerHTML = formatText(mergedText);

                    makeDraggable(translationText);
                }
            });

            currentIndex++;
            setTimeout(addImage, 50);
        };



        image.onerror = () => {
            if (retryCount < 3) {
                retryCount++;
                console.log('Retry attempt ' + retryCount + ' for image ' + currentIndex);
                setTimeout(loadImage, 2000);
            } else {
                console.error(
                    'Failed to load image ' + currentIndex + ' after ' + 3 + ' attempts'
                );
                loadingSpinner.remove();
                const errorMessage = document.createElement('p');
                errorMessage.textContent = 'Failed to load image. Please try again later.';
                imageContainer.appendChild(errorMessage);
                currentIndex++;
                setTimeout(addImage, 50);
            }
        };
    }

    loadImage();
}

addImage();

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