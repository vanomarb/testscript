export default function loader() {
    return `<div
                class="relative w-full h-screen inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                <div
                    class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center px-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-loader-circle w-10 h-10 sm:w-12 sm:h-12 mb-3 mx-auto animate-spin text-yellow-400"
                        aria-hidden="true">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                    </svg>
                    <p class="text-xs sm:text-sm font-semibold tracking-wider text-white">Loading images...</p>
                    <div class="flex gap-1 mt-2 justify-center"><span
                            class="w-2 h-2 rounded-full animate-pulse bg-yellow-400"
                            style="animation-delay: 0ms;"></span><span
                            class="w-2 h-2 rounded-full animate-pulse bg-yellow-400"
                            style="animation-delay: 150ms;"></span><span
                            class="w-2 h-2 rounded-full animate-pulse bg-yellow-400"
                            style="animation-delay: 300ms;"></span>
                    </div>
                </div>
            </div>`;
}