import Component from "../core/components.js";
import MangaInfo from "./manga_info.js";
import MangaInfoMobile from "./manga_info_mobile.js";
import MangaChapterList from "./manga_chapter_list.js";
import ChapterFilter from "./chapter_filter.js";

export default class MangaPage extends Component {
    constructor(props) {
        super(props);
        this.router = props.router;
        this.mangaId = props.mangaId;
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

    async mounted() {
        await this.fetchMangaInfo();
        // this.fetchChapters();
        // this.title = title;
        // this.status = status;
        // this.author = author;
        // this.thumbnail = thumbnail;
        // this.description = description;
        // this.genres = genres;
        // this.id = id;
        // this.rate = rate;
        // this.chapters = chapters;
        // this.chapterCount = chapterCount;
    }

    setup() {
        this.state = {
            mangas: null,
            chapters: null,
            loading: true,
            error: null,
        };
    }

    async fetchMangaInfo() {

        try {
            const res = await fetch(`${this.API_URL}/manga?slug=${this.mangaId}`);
            const data = await res.json();
            this.setState({ mangas: data, loading: false }, () => {
                this.mangaInfoMobile();
                this.mangaInfo();
                this.mangaChapterFilter();
                this.mangaChapterList();
            });
        } catch (err) {
            console.error(err);
            this.setState({ error: err.message, loading: false });
        }
    }

    async fetchChapters() {

        try {
            const res = await fetch(`${this.API_URL}/chapters?id=${this.mangaId}`);
            const data = await res.json();
            this.setState({ chapters: data, loading: false });
        } catch (err) {
            console.error(err);
            this.setState({ error: err.message, loading: false });
        }
    }


    template() {
        return `<div class="min-h-full w-full">
                    <div class="relative">
                        <div class="absolute backdrop-cover inset-x-0 top-0 h-[220px] md:h-[350px] bg-cover bg-center"
                            style="background-image: url('${this.thumbnail}');">
                            <div class="absolute inset-0 backdrop-blur-sm h-[220px] md:h-[350px] bg-black/50 drop-blur-sm z-10"></div>
                        </div>
                        <main class="relative px-4 sm:px-6 md:px-10">
                            <div class="mob relative z-10 pt-24 sm:pt-8 md:p-8 pb-0"></div>
                        </main>
                    </div>
                    <div class="flex flex-col w-full gap-2 sm:gap-4 lg:flex-row text-white font-sans transition-colors duration-0 px-8">
                        <div class="flex-1 space-y-2 sm:space-y-4"></div>
                    </div>
                </div>`;
    }

    mangaInfoMobile() {
        const container = this.$element.querySelector(".mob");
        // container.innerHTML = "";
        const backdropCover = document.querySelector('.backdrop-cover');
        backdropCover.style.backgroundImage = `url('${this.state.mangas.thumbnail}')`;
        const $target = document.createElement('div');
        const targetClassNames = 'block md:hidden';
        $target.classList.add(...targetClassNames.split(" "));
        const { translatedTitle, translatedDescription, englishTitle, title, status, author, thumbnail, description, genres, id, rate, chapters, chapterCount } = this.state.mangas;
        new MangaInfoMobile({
            $element: $target,
            router: this.router,
            translatedTitle: translatedTitle,
            translatedDescription: translatedDescription,
            englishTitle: englishTitle,
            title: title,
            status: status,
            author: author,
            thumbnail: thumbnail,
            description: description,
            genres: genres,
            id: id,
            rate: rate,
            chapters: chapters,
            chapterCount: chapterCount
        }).render();
        container.appendChild($target);
    }

    mangaChapterFilter() {
        const container = this.$element.querySelector(".flex-1.space-y-2.sm\\:space-y-4");
        const $target = document.createElement('div');
        const targetClassNames = 'chapter-filter flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4 gap-2 sm:gap-4';
        $target.classList.add(...targetClassNames.split(" "));
        new ChapterFilter({
            $element: $target,
            router: this.router,
        }).render();
        container.appendChild($target);
    }

    mangaChapterList() {
        // append on container min-h-full w-full
        const container = this.$element.querySelector(".flex-1.space-y-2.sm\\:space-y-4");
        const $target = document.createElement('div');
        const targetClassNames = 'manga-chapter-list space-y-1 max-h-[600px] sm:max-h-[1200px] overflow-y-auto overflow-x-visible grid grid-cols-1 lg:grid-cols-2 gap-2';
        $target.classList.add(...targetClassNames.split(" "));
        const { chapters } = this.state.mangas;
        new MangaChapterList({
            $element: $target,
            mangaId: this.mangaId,
            router: this.router,
            chapters: chapters
        }).render();
        container.appendChild($target);
    }

    mangaInfo() {
        const container = this.$element.querySelector(".mob");
        const $target = document.createElement('div');
        const targetClassNames = 'hidden md:flex gap-8 mt-14';
        $target.classList.add(...targetClassNames.split(" "));
        const { translatedTitle, translatedDescription, englishTitle, title, status, author, thumbnail, description, genres, id, rate, chapters, chapterCount } = this.state.mangas;
        new MangaInfo({
            $element: $target,
            router: this.router,
            translatedTitle: translatedTitle,
            translatedDescription: translatedDescription,
            englishTitle: englishTitle,
            title: title,
            status: status,
            author: author,
            thumbnail: thumbnail,
            description: description,
            genres: genres,
            id: id,
            rate: rate,
            chapters: chapters,
            chapterCount: chapterCount
        }).render();
        container.appendChild($target);
    }
}