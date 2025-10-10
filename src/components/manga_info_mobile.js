import Component from "../core/components";

export default class MangaPage extends Component {
    constructor(props) {
        super(props);
        this.router = props.router;
        this.title = props.title;
        this.status = props.status;
        this.author = props.author;
        this.genres = props.genres || [];
        this.description = props.description;
        this.thumbnail = props.thumbnail;
        this.id = props.id;
        this.rate = props.rate;
        this.chapters = props.chapters || [];
        this.chapterCount = props.chapterCount || 0;
    }

    template() {
        const { title, status, author, genres, description, thumbnail, id, rate, chapters, chapterCount } = this;

        // get last value of chapters array
        const lastChapter = chapters[chapters.length - 1];

        // get first value of chapters array
        const firstChapter = chapters[0];
        return `
        <div class="block md:hidden">
            <div class="flex justify-center mb-6">
                <div class="relative w-36 h-52 sm:w-40 sm:h-56 group select-none shadow-2xl"><a
                        href="${thumbnail}"
                        class="block relative w-full h-full">
                        <div
                            class="absolute inset-0 bg-contain group-hover:scale-105 z-50 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-0 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round"
                                class="lucide lucide-list text-white" aria-hidden="true">
                                <path d="M3 12h.01"></path>
                                <path d="M3 18h.01"></path>
                                <path d="M3 6h.01"></path>
                                <path d="M8 12h13"></path>
                                <path d="M8 18h13"></path>
                                <path d="M8 6h13"></path>
                            </svg>
                        </div>
                        <img alt="Cover image" loading="lazy" width="160" height="224"
                            decoding="async" data-nimg="1" class="w-full h-full rounded-lg shadow-2xl transition-transform duration-0 group-hover:scale-105 object-cover" src="${thumbnail}"style="color: transparent;">
                    </a>
                </div>
            </div>
            <div class="text-center mb-6 px-2">
                <h1 class="text-white text-2xl sm:text-3xl font-bold drop-shadow-lg mb-2 leading-tight">
                    ${title}
                </h1>
                <p class="text-white/70 text-sm mb-4">Author: <span class="text-white font-medium">${author}</span></p>
            </div>
            <div class="grid grid-cols-2 w-full gap-2">
                <a class="font-medium rounded transition-colors duration-0 focus:outline-none flex items-center justify-center bg-purple-900/70 text-white hover:bg-purple-950 disabled:bg-gray-400 px-4 py-2 text-base h-10 cursor-pointer w-full mb-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6 rounded-lg shadow-lg" type="button" href="/manga/${id}/chapter/${firstChapter.slug}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open w-5 h-5 mr-2" aria-hidden="true">
                        <path d="M12 7v14"></path>
                        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z">
                        </path>
                    </svg>Start Reading
                </a>
                <a class="font-medium rounded transition-colors duration-0 focus:outline-none flex items-center justify-center bg-purple-900/70 text-white hover:bg-purple-950 disabled:bg-gray-400 px-4 py-2 text-base h-10 cursor-pointer w-full mb-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-6 rounded-lg shadow-lg" type="button" href="/manga/${id}/chapter/${lastChapter.slug}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open w-5 h-5 mr-2" aria-hidden="true">
                        <path d="M12 7v14"></path>
                        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z">
                        </path>
                    </svg>Read Latest
                </a>
            </div>
            <div class="flex justify-center items-center gap-6 mb-6 px-4">
                <div class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" width="24"
                        height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-star w-4 h-4 mr-1 text-yellow-400" aria-hidden="true">
                        <path
                            d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z">
                        </path>
                    </svg>
                    <span class="text-yellow-400 text-sm font-semibold">${rate}</span>
                </div>
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24"
                        height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-eye w-4 h-4 mr-1 text-white/70" aria-hidden="true">
                        <path
                            d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0">
                        </path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span class="text-white text-sm">659</span>
                </div>
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24"
                        height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round" stroke-linejoin="round"
                        class="lucide lucide-users w-4 h-4 mr-1 text-pink-400" aria-hidden="true">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                    </svg>
                    <span class="text-pink-400 text-sm font-semibold">${chapterCount}</span>
                </div>
            </div>
            <div class="text-center mb-6">
                <div class="flex items-center justify-center text-white/60 text-sm"><svg
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" class="lucide lucide-book w-4 h-4 mr-2" aria-hidden="true">
                        <path
                            d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20">
                        </path>
                    </svg><span class="uppercase font-medium">${status}</span>
                </div>
            </div>
            <div class="px-4 mb-0">
                <button class="flex items-center justify-center gap-2 bg-white/10 text-white hover:bg-white/20 backdrop-blur-md rounded px-4 py-2 transition-colors duration-0 w-fit mx-auto lg:mx-0" type="button">
                    <span class="text-sm font-medium">Show More Details</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4" aria-hidden="true">
                        <path d="m6 9 6 6 6-6"></path>
                    </svg>
                </button>
            </div>
        </div>`;
    }
}