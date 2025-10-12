import Component from "../core/components";
import MangaGenres from "./manga_genres.js";
import MangaDescription from "./manga_description.js";

export default class MangaInfoMobile extends Component {
    constructor(props) {
        super(props);
        this.$element = props.$element;
        this.router = props.router;
        this.translatedTitle = props.translatedTitle;
        this.translatedDescription = props.translatedDescription;
        this.englishTitle = props.englishTitle;
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
        const { translatedTitle, title, englishTitle, status, author, thumbnail, id, rate, chapters, chapterCount } = this;
        // get last value of chapters array
        const lastChapter = chapters[chapters.length - 1];

        // get first value of chapters array
        const firstChapter = chapters[0];
        return `
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
                    ${englishTitle || translatedTitle}
                </h1>
                <p class="text-white/80 text-sm sm:text-base ${englishTitle ? '' : 'mb-3'} font-medium">${englishTitle ? translatedTitle : title}</p>
                <p class="text-white/80 text-sm sm:text-base ${englishTitle && translatedTitle ? 'mb-3' : ''} font-medium">${englishTitle && translatedTitle ? title : ''}</p>
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
                        class="w-4 h-4 mr-1 text-white/70" aria-hidden="true">
                        <path
                            d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0">
                        </path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span class="text-white text-sm">659</span>
                </div>
                <div class="flex items-center">
                    <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" class="w-4 h-4 mr-1 text-white/50" aria-hidden="true" data-current="true" data-collapsed="true" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M352 96c0-53.02-42.98-96-96-96s-96 42.98-96 96 42.98 96 96 96 96-42.98 96-96zM233.59 241.1c-59.33-36.32-155.43-46.3-203.79-49.05C13.55 191.13 0 203.51 0 219.14v222.8c0 14.33 11.59 26.28 26.49 27.05 43.66 2.29 131.99 10.68 193.04 41.43 9.37 4.72 20.48-1.71 20.48-11.87V252.56c-.01-4.67-2.32-8.95-6.42-11.46zm248.61-49.05c-48.35 2.74-144.46 12.73-203.78 49.05-4.1 2.51-6.41 6.96-6.41 11.63v245.79c0 10.19 11.14 16.63 20.54 11.9 61.04-30.72 149.32-39.11 192.97-41.4 14.9-.78 26.49-12.73 26.49-27.06V219.14c-.01-15.63-13.56-28.01-29.81-27.09z"></path></svg>
                    <span class="text-white/50 text-sm font-semibold">${chapterCount}</span>
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
                <button class="show_details flex items-center justify-center gap-2 bg-white/10 text-white hover:bg-white/20 backdrop-blur-md rounded px-4 py-2 transition-colors duration-0 w-fit mx-auto lg:mx-0" type="button">
                    <span class="text-sm font-medium">Show More Details</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4" aria-hidden="true">
                        <path d="m6 9 6 6 6-6"></path>
                    </svg>
                </button>
                <div class="more_details"></div>
            </div>`;
    }

    setEvent() {
        this.$element.addEventListener("click", (e) => {
            if (e.target.closest(".show_details")) {

                // update svg path m18 15-6-6-6 6
                const svgPath = this.$element.querySelector(".show_details svg path");
                const spanPath = this.$element.querySelector(".show_details span");
                spanPath.textContent = spanPath.textContent === "Show More Details" ? "Show Less" : "Show More Details";
                svgPath.getAttribute("d") === "m18 15-6-6-6 6" ? svgPath.setAttribute("d", "m6 9 6 6 6-6") : svgPath.setAttribute("d", "m18 15-6-6-6 6");

                const container = this.$element.querySelector(".more_details");
                const description = container.querySelector(".manga-description");
                const genres = container.querySelector(".manga-genres");

                if (description && genres) {
                    container.innerHTML = "";
                } else {
                    // append description and genres
                    this.fetchMangaDescription();
                    this.fetchGenres();
                }
            }
        });
    }


    // afterRender() {
    //     this.fetchMangaDescription();
    //     this.fetchGenres();
    // }

    fetchMangaDescription() {
        const container = this.$element.querySelector(".more_details");
        const $target = document.createElement('div');
        $target.classList.add("manga-description");
        // $target.classList.add("hidden");
        const descriptionComponent = new MangaDescription({
            $element: $target,
            translatedDescription: this.translatedDescription,
            description: this.description,
            isMobile: true,
        });
        descriptionComponent.render();
        container.appendChild($target);
    }

    fetchGenres() {
        const container = this.$element.querySelector(".more_details");
        const $target = document.createElement('div');
        $target.classList.add("manga-genres");
        // $target.classList.add("hidden");
        const genresComponent = new MangaGenres({
            $element: $target,
            genres: this.genres,
        });
        genresComponent.render();
        container.appendChild($target);
    }
}