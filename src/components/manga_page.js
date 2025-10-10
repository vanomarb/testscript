import Component from "../core/components.js";
import MangaGenres from "./manga_genres.js";
import MangaDescription from "./manga_description.js";
import MangaInfo from "./manga_info.js";
import MangaInfoMobile from "./manga_info_mobile.js";

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

    mounted() {
        this.fetchMangaInfo();
        // this.fetchChapters();
        const mangaInfoMobile = new MangaInfoMobile({
            title: this.title,
            author: this.author,
            status: this.status,
            genres: this.genres
        });
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
            this.setState({ mangas: data, loading: false });
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
        return `
        <div class="w-full relative z-20 min-h-screen -mt-20 overflow-hidden bg-transparent flex flex-col gap-12 text-white">
            <div class="min-h-full w-full ">
                <div class="relative ">
                    <div class="absolute  inset-x-0 top-0 h-[220px] md:h-[350px] bg-cover bg-center"
                        style="background-image: url('${this.thumbnail}');">
                        <div class="absolute inset-0 backdrop-blur-sm h-[220px] md:h-[350px] bg-black/50 drop-blur-sm z-10">
                        </div>
                    </div>
                    <main class="relative px-4 sm:px-6 md:px-10">
                        <div class="relative z-10 pt-24 sm:pt-8 md:p-8 pb-0">
                            ${mangaInfoMobile.render()}
                        </div>
                    </main>
                </div>
            </div>
        </div>`;
    }
}