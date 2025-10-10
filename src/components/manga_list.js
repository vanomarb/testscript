import Component from "../core/components.js";
import loader from "./loader.js";
import MangaCard from "./manga_card.js";

export default class MangaList extends Component {
  constructor(props) {
    super(props);
    this.router = props.router;
    this.mangaId = props.mangaId;
  }

  setup() {
    this.state = {
      mangas: [],
      latestManga: [],
      popularManga: [],
      loading: true,
      error: null,
      type: '', // default type
      complete: false,
    };
  }

  async mounted() {
    await Promise.all([this.fetchPopularMangas(), this.fetchLatestMangas()]).then(() => {
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

  async fetchLatestMangas() {
    try {
      const res = await fetch(`${this.API_URL}/latest?page=1`);
      const data = await res.json();
      this.setState({ latestManga: data.mangas, loading: false });
    } catch (err) {
      console.error(err);
      this.setState({ error: err, loading: false });
    }
  }

  renderHeaderBanner() {
    return `
      <div data-library-header-container="true"
        class="LIB_HEADER_CONTAINER __header h-[25rem] z-[1] top-0 w-full group/library-header fixed">
        <div data-library-header-inner-container="true"
          class="LIB_HEADER_INNER_CONTAINER h-full z-[0] w-full flex-none object-cover object-center absolute top-0 overflow-hidden bg-[--background]"
          style="opacity:1;transform:none;">
          <div class="hidden lg:block h-full absolute z-[2] w-[20%] opacity-70 left-0 top-0 bg-gradient-to-r from-[var(--background)] to-transparent"></div>
          <div class="w-full z-[3] opacity-70 lg:opacity-50 absolute top-0 h-[5rem] bg-gradient-to-b from-[--background] to-transparent"></div>
          <div style="opacity:1;">
            <img alt="banner image" class="object-cover object-center z-[1] opacity-100 transition-opacity duration-700"
              src="https://s4.anilist.co/file/anilistcdn/media/manga/banner/151460-zE0YRolZcxEq.jpg"
              style="position:absolute;height:100%;width:100%;inset:0;color:transparent;">
          </div>
          <div class="LIB_HEADER_IMG_BOTTOM_FADE w-full z-[2] absolute bottom-0 h-[20rem] lg:h-[15rem] bg-gradient-to-t from-[--background] lg:via-opacity-50 lg:via-10% to-transparent"></div>
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
      <div data-main-layout-content="true" class="bg-black text-white">
        <div data-manga-page-container="true">
          ${this.renderHeaderBanner()}
          <div data-manga-page-dynamic-banner-spacer="true" class="h-40"></div>
          <div data-page-wrapper-container="true">
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
    console.log("Rendering manga cards:", this.state.mangas);

    // dynamically add popular and latest mangas to the list
    const popularWithType = this.state.popularManga.map(manga => ({ ...manga, type: 'popular' }));
    const latestWithType = this.state.latestManga.map(manga => ({ ...manga, type: 'latest' }));
    this.state.mangas = [...popularWithType, ...latestWithType, ...this.state.mangas];
    console.log("After adding popular and latest:", this.state.mangas);

    // Group mangas by type dynamically
    const grouped = this.state.mangas.reduce((acc, manga) => {
      const key = manga.type || "uncategorized";
      if (!acc[key]) acc[key] = [];
      acc[key].push(manga);
      return acc;
    }, {});

    // For each type (popular, recommended, etc.)
    Object.entries(grouped).forEach(([type, mangas]) => {
      const groupWrapper = document.createElement("div");
      groupWrapper.setAttribute("data-manga-type-group", type);

      // Header separator
      const titleEl = document.createElement("h2");
      titleEl.className = "text-2xl font-bold text-white mb-4 capitalize border-b border-gray-700 pb-2";
      titleEl.textContent = `${type.replace(/_/g, " ")}`;

      // Grid container for this type
      const gridEl = document.createElement("div");
      gridEl.className =
        "grid grid-cols-2 min-[768px]:grid-cols-3 min-[1080px]:grid-cols-4 min-[1320px]:grid-cols-5 min-[1750px]:grid-cols-6 min-[1850px]:grid-cols-7 min-[2000px]:grid-cols-8 gap-4";

      // Render each manga card inside the grid
      mangas.forEach((manga, index) => {
        const cardEl = document.createElement("div");
        const cardElClass = "transition-all duration-300 ease-in-out";
        cardEl.classList.add(...cardElClass.split(" "));
        cardEl.setAttribute("data-media-card-lazy-grid-item", "true");
        cardEl.setAttribute("data-index", index);

        const card = new MangaCard({
          $element: cardEl,
          router: this.router,
          id: manga.url,
          title: manga.title,
          genres: manga.genres,
          type: manga.type,
          year: manga.year || "N/A",
          coverImage: manga.thumbnail,
        });
        card.render();
        gridEl.appendChild(cardEl);
      });

      groupWrapper.appendChild(titleEl);
      groupWrapper.appendChild(gridEl);
      container.appendChild(groupWrapper);
    });
  }
}
