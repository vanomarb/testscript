import Component from "../core/components.js";
import loader from "./loader.js";
import MangaCard from "./manga_card.js";
import EmblaCarousel from "embla-carousel";
import { addPrevNextBtnsClickHandlers } from '../helpers/embla_arrow_buttons.js'

export default class MangaList extends Component {
  constructor(props) {
    super(props);
    this.router = props.router;
    this.mangaId = props.mangaId;
    this.$element = props.$element;
    this.$container = null;
  }

  setup() {
    this.state = {
      mangas: [],
      latestManga: [],
      popularManga: [],
      newManga: [],
      loading: true,
      error: null,
      type: '',
      complete: false,
    };
  }

  async mounted() {
    await Promise.all([this.fetchPopularMangas(), this.fetchNewMangas(), this.fetchLatestMangas()]).then(() => {
      this.renderCards();
    });
  }

  async fetchMangas() {
    try {
      const res = await fetch(`${this.API_URL}/api/manga-list`);
      const data = await res.json();
      this.setState({ mangas: data, loading: false }, () => this.renderCards());
    } catch (err) {
      console.error(err);
      this.setState({ error: err, loading: false });
    }
  }

  async fetchPopularMangas() {
    try {
      const res = await fetch(`${this.API_URL}/popular?page=1`);
      const data = await res.json();
      this.setState({ popularManga: data.mangas, loading: false });
    } catch (err) {
      console.error(err);
      this.setState({ error: err, loading: false });
    }
  }

  async fetchNewMangas() {
    try {
      const res = await fetch(`${this.API_URL}/new?page=1`);
      const data = await res.json();
      this.setState({ newManga: data.mangas, loading: false });
    } catch (err) {
      console.error(err);
      this.setState({ error: err, loading: false });
    }
  }

  async fetchLatestMangas() {
    try {
      const res = await fetch(`${this.API_URL}/latest`);
      const data = await res.json();
      this.setState({ latestManga: data.mangas, loading: false });
    } catch (err) {
      console.error(err);
      this.setState({ error: err, loading: false });
    }
  }

  renderHeaderBanner() {
    return `
      <div data-library-header-container="true" class="__header h-[25rem] z-[1] top-0 w-full group/library-header fixed">
        <div data-banner-image-container="true"
            class="lg:h-[35rem] w-full flex-none object-cover object-center absolute bg-[--background] lg:w-[calc(100%_+_5rem)] lg:left-[-5rem] top-[-2rem]">
            <div data-banner-image-top-gradient="true"
                class="w-full z-[2] absolute bottom-[-10rem] h-[10rem] bg-gradient-to-b from-[--background] via-transparent via-100% to-transparent">
            </div>
            <div data-banner-image-top-gradient-2="true"
                class="w-full absolute z-[2] top-0 h-[10rem] opacity-50 bg-gradient-to-b from-[--background] to-transparent via">
            </div>
            <div data-banner-image-background="true"
                class="opacity-0 duration-1000 bg-[var(--background)] w-full h-full absolute z-[2]"></div>
            <div class="w-full h-full absolute z-[1] overflow-hidden">
              <img data-banner-image="true" alt="banner image" decoding="async" data-nimg="fill" class="banner-image object-cover object-center z-[1] translate-x-0 blur-lg" src="" style="position: absolute; height: 100%; width: 100%; inset: 0px; color: transparent;"></div>
            <div data-banner-image-right-gradient="true"
                class="hidden lg:block w-full z-[2] h-full absolute left-0 bg-gradient-to-r from-20% from-black via-transparent via-50% via-black/40 via-[--background] to-transparent">
            </div>
            <div data-banner-image-left-gradient="true"
                class="hidden lg:block max-w-[10rem] w-full z-[2] h-full absolute left-0 bg-gradient-to-r from-black via-neutral-900 to-transparent opacity-70 duration-500">
            </div>
            <div data-banner-image-bottom-gradient="true"
                class="w-full z-[2] absolute bottom-0 h-[20rem] bg-gradient-to-t from-black via-neutral-900 to-transparent">
            </div>
        </div>
      </div>
    `;
  }

  template() {
    if (this.state.loading) {
      return loader();
    }

    if (this.state.error) {
      return `<div class="error text-red-500 text-center">Failed to load chapters.</div>`;
    }

    return `
      <div data-main-layout-content="true" class="bg-black text-white layout-wrapper">
        <div data-manga-page-container="true">
          ${this.renderHeaderBanner()}
          <div data-manga-page-dynamic-banner-spacer="true" class="h-40"></div>
          <div data-page-wrapper-container="true" class="mt-10">
            <div data-page-wrapper="true" class="p-4 space-y-8 relative z-[4]" style="opacity:1;">
              <div data-media-card-lazy-grid="true" id="manga-grid" class="grid grid-cols-2 min-[768px]:grid-cols-3 min-[1080px]:grid-cols-4 min-[1320px]:grid-cols-5 min-[1750px]:grid-cols-6 min-[1850px]:grid-cols-7 min-[2000px]:grid-cols-8 gap-4">
              </div>
              <div id="manga-type-groups" class="space-y-12"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderCards() {
    const container = this.$element.querySelector("#manga-type-groups");
    container.innerHTML = "";

    // ✅ Dynamically add popular & latest to the unified list
    const popularWithType = this.state.popularManga?.map((manga) => ({
      ...manga,
      type: "popular",
    })) || [];
    const newWithType = this.state.newManga?.map((manga) => ({
      ...manga,
      type: "new updates",
    })) || [];
    const latestWithType = this.state.latestManga?.map((manga) => ({
      ...manga,
      type: "hot updates",
    })) || [];

    this.state.mangas = [...popularWithType, ...newWithType, ...latestWithType, ...this.state.mangas];

    // ✅ Group mangas by type dynamically
    const grouped = this.state.mangas.reduce((acc, manga) => {
      const key = manga.type || "uncategorized";
      if (!acc[key]) acc[key] = [];
      acc[key].push(manga);
      return acc;
    }, {});

    // ✅ Loop through all sections
    Object.entries(grouped).forEach(([type, mangas]) => {
      const groupWrapper = document.createElement("div");
      groupWrapper.setAttribute("data-manga-type-group", type);

      // Section Title
      const titleEl = document.createElement("h2");
      titleEl.className =
        "text-2xl md:text-3xl font-bold text-white mb-4 capitalize border-b border-gray-700 pb-2";
      titleEl.textContent = `${type.replace(/_/g, " ")}`;

      // --- 🧠 Detect if section should be carousel ---
      if (type !== "hot updates") {
        // Create Embla structure
        const emblaWrapper = document.createElement("div");
        emblaWrapper.className = "relative embla overflow-hidden";

        const emblaContainer = document.createElement("div");
        emblaContainer.className = "embla__container flex gap-4";

        // Add slides
        mangas.forEach((manga, index) => {
          const slide = document.createElement("div");
          slide.className =
            "embla__slide h-fit flex-[0_0_22%] md:flex-[0_0_25%] lg:flex-[0_0_11%]";
          slide.setAttribute("data-index", index);

          const cardEl = document.createElement("div");
          cardEl.className = "transition-all duration-300 ease-in-out";
          cardEl.setAttribute("data-media-card-lazy-grid-item", "true");

          const card = new MangaCard({
            $element: cardEl,
            router: this.router,
            id: manga.url,
            translatedTitle: manga.translatedTitle,
            title: manga.title,
            genres: manga.genres,
            type: manga.type,
            year: manga.year || "N/A",
            coverImage: manga.thumbnail,
          });
          card.render();

          slide.appendChild(cardEl);
          emblaContainer.appendChild(slide);
        });

        emblaWrapper.appendChild(emblaContainer);
        groupWrapper.appendChild(titleEl);
        groupWrapper.appendChild(emblaWrapper);
        container.appendChild(groupWrapper);

        // Initialize carousel
        requestAnimationFrame(() => {
          const embla = EmblaCarousel(emblaWrapper, {
            align: "start",
            dragFree: true
          });
          this.addCarouselControls(groupWrapper, embla);
        });
      } else {
        // --- 🧩 Default grid for other sections ---
        const gridEl = document.createElement("div");
        gridEl.className = `grid grid-cols-2 ${type == 'hot updates' ? 'md:grid-cols-4 lg:grid-cols-6' : 'sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8'} justify-center gap-2`;

        mangas.forEach((manga, index) => {
          const cardEl = document.createElement("div");
          cardEl.className = "transition-all duration-300 ease-in-out";
          cardEl.setAttribute("data-media-card-lazy-grid-item", "true");
          cardEl.setAttribute("data-index", index);

          if(manga.time === '刚刚') {
            manga.time = 'just now';
          }else if(manga.time && manga.time.includes('分钟前')) {
            manga.time = manga.time.replace('分钟前', ' minutes ago');
          }else if(manga.time && manga.time.includes('小时前')) {
            manga.time = manga.time.replace('小时前', ' hours ago');
          }else if(manga.time && manga.time.includes('天前')) {
            manga.time = manga.time.replace('天前', ' days ago');
          }

          const card = new MangaCard({
            $element: cardEl,
            router: this.router,
            id: manga.url.replace(/\/manga\//, '') || manga.url,
            translatedTitle: manga.translatedTitle,
            title: manga.title,
            genres: manga.genres,
            type: manga.type,
            year: manga.year || "N/A",
            coverImage: manga.thumbnail,
            chapter: manga.chapter,
            time: manga.time
          });
          card.render();
          gridEl.appendChild(cardEl);
        });

        groupWrapper.appendChild(titleEl);
        groupWrapper.appendChild(gridEl);
        container.appendChild(groupWrapper);
      }
    });
  }
  addCarouselControls(wrapper, embla) {
    const controls = document.createElement("div");
    controls.className = `absolute inset-y-0 left-0 right-0 flex justify-between items-center px-4 sm:px-6 md:px-8 pointer-events-none`;

    controls.innerHTML = `
      <button class="embla__button embla__button--prev pointer-events-auto p-2 sm:p-3 md:p-4 rounded-full bg-black/40 hover:bg-black/70 text-white shadow-md transition-transform hover:scale-110 active:scale-95">
        <svg class="embla__button__svg w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" viewBox="0 0 532 532">
          <path fill="currentColor" d="M355.66 11.354c13.793-13.805 36.208-13.805 50.001 0 13.785 13.804 13.785 36.238 0 50.034L201.22 266l204.442 204.61c13.785 13.805 13.785 36.239 0 50.044-13.793 13.796-36.208 13.796-50.002 0a5994246.277 5994246.277 0 0 0-229.332-229.454 35.065 35.065 0 0 1-10.326-25.126c0-9.2 3.393-18.26 10.326-25.2C172.192 194.973 332.731 34.31 355.66 11.354Z"></path>
        </svg>
      </button>
      <button class="embla__button embla__button--next pointer-events-auto p-2 sm:p-3 md:p-4 rounded-full bg-black/40 hover:bg-black/70 text-white shadow-md transition-transform hover:scale-110 active:scale-95">
        <svg class="embla__button__svg w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" viewBox="0 0 532 532">
          <path fill="currentColor" d="M176.34 520.646c-13.793 13.805-36.208 13.805-50.001 0-13.785-13.804-13.785-36.238 0-50.034L330.78 266 126.34 61.391c-13.785-13.805-13.785-36.239 0-50.044 13.793-13.796 36.208-13.796 50.002 0 22.928 22.947 206.395 206.507 229.332 229.454a35.065 35.065 0 0 1 10.326 25.126c0 9.2-3.393 18.26-10.326 25.2-45.865 45.901-206.404 206.564-229.332 229.52Z"></path>
        </svg>
      </button>
    `;

    wrapper.querySelector(".embla").appendChild(controls);

    const prev = controls.querySelector(".embla__button--prev");
    const next = controls.querySelector(".embla__button--next");

    prev.addEventListener("click", () => embla.scrollPrev());
    next.addEventListener("click", () => embla.scrollNext());
  }

  afterRender() {
    const $target = this.$element.querySelector('.banner-image');
    // loop through all popular managas and add every thumbnail to the header banner on 10 seconds interval using the popularManga state as reference
    // add transition fade effect transition-opacity duration-700 ease-in opacity-100
    if ($target) {
      $target.classList.add("transition-opacity", "duration-700", "ease-in", "opacity-100");
    }
    
    let index = 1;
    if (this.state.popularManga.length > 0) {
      if ($target) {
        $target.src = this.state.popularManga[0].thumbnail;
      }
      setInterval(() => {
        if ($target) {
          $target.src = this.state.popularManga[index].thumbnail;
          index++;
        }
        if (index >= this.state.popularManga.length) {
          index = 0;
        }
      }, 10000);
    }
  }
}
