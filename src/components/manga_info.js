import Component from "../core/components";

export default class MangaInfo extends Component {
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
        <div class="hidden md:flex gap-8 mt-14">
            <div class="relative w-40 h-60 lg:w-48 lg:h-[295px] group select-none mx-auto md:mx-0">
                <a href="${thumbnail}" class="block relative w-full h-full">
                    <div class="absolute inset-0 z-50 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-0 rounded">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" class="lucide lucide-list text-white"
                            aria-hidden="true">
                            <path d="M3 12h.01"></path>
                            <path d="M3 18h.01"></path>
                            <path d="M3 6h.01"></path>
                            <path d="M8 12h13"></path>
                            <path d="M8 18h13"></path>
                            <path d="M8 6h13"></path>
                        </svg>
                    </div>
                    <img alt="Cover image" loading="lazy" width="384" height="295" decoding="async"
                        data-nimg="1" class="w-full h-full rounded shadow-black shadow-lg  transition-all duration-0 group-hover:translate-y-0 object-cover" src="${thumbnail}" style="color: transparent;">
                </a>
            </div>
            <div class="flex-1">
                <div class="h-72 flex justify-between flex-col">
                    <div class="flex flex-col">
                        <h1 class="text-white text-5xl lg:text-7xl line-clamp-1 max-w-[80%] font-bold drop-shadow-lg">
                            ${title}
                        </h1>
                    </div>
                    <p class="text-white text-base mb-8">${author}</p>
                </div>
                <div class="flex gap-4 mb-5">
                    <a class="font-medium rounded transition-colors duration-0 focus:outline-none flex items-center justify-center bg-gray-600/30 text-white hover:bg-[#666666] disabled:bg-gray-400 px-6 py-3 text-base h-12 cursor-pointer"
                        type="button" href="/manga/${id}/chapter/${firstChapter.slug}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" class="lucide lucide-book-open w-5 h-5 mr-2"
                            aria-hidden="true">
                            <path d="M12 7v14"></path>
                            <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z">
                            </path>
                        </svg>
                        Start Reading
                    </a>
                    <a class="font-medium rounded transition-colors duration-0 focus:outline-none flex items-center justify-center bg-gray-600/30 text-white hover:bg-[#666666] disabled:bg-gray-400 px-6 py-3 text-base h-12 cursor-pointer"
                        type="button" href="/manga/${id}/chapter/${lastChapter.slug}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" class="lucide lucide-book-open w-5 h-5 mr-2"
                            aria-hidden="true">
                            <path d="M12 7v14"></path>
                            <path
                                d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z">
                            </path>
                        </svg>
                        Read Latest Chapter
                    </a>
                    <div class="flex items-center gap-6">
                        <div class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" width="24"
                                height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                class="lucide lucide-star w-4 h-4 mr-1 text-yellow-400" aria-hidden="true">
                                <path
                                    d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z">
                                </path>
                            </svg><span class="text-yellow-400 text-base">${rate}</span>
                        </div>
                        <div class="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" width="24"
                                height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                class="lucide lucide-library w-4 h-4 mr-1 text-white" aria-hidden="true">
                                <path d="m16 6 4 14"></path>
                                <path d="M12 6v14"></path>
                                <path d="M8 8v12"></path>
                                <path d="M4 4v16"></path>
                            </svg>
                            <span class="text-white text-base">${chapterCount}</span>
                        </div>
                        <div class="flex items-center ml-2"><svg xmlns="http://www.w3.org/2000/svg"
                                width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                class="lucide lucide-book w-4 h-4 mr-2 text-white" aria-hidden="true">
                                <path
                                    d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20">
                                </path>
                            </svg>
                            <span class="text-white text-xs font-bold uppercase">${status}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    }
}