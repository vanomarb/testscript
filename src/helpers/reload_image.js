export function reloadImage({ imgUrl, container, imageData, maxRetries = 3, onSuccess, onFail }) {
    return new Promise((resolve) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.className = "w-full shadow-md object-contain";
        image.style.display = "none";

        const tryLoad = (attempt = 0) => {
            image.src = imgUrl;

            image.onload = () => {
                image.style.display = "block";
                container.appendChild(image);
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
