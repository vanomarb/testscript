import Component from "../core/components.js";

export default class MangaCard extends Component {
    constructor(props) {
        super(props);
        this.router = props.router;
        this.id = props.id;
        this.title = props.title;
        this.genres = props.genres;
        this.year = props.year;
        this.coverImage = props.coverImage;
    }

    template() {
        const { id, title, genres, type, year, coverImage } = this;

        // separate container div if different type
        return `
        <div data-media-card-lazy-grid-item-content="true">
            <div data-media-entry-card-container="true"
              class="h-full col-span-1 group/media-entry-card relative flex flex-col place-content-stretch focus-visible:outline-0 flex-none"
              data-media-id="${id}" data-media-type="manga">
              <a class="cursor-pointer w-full relative focus-visible:ring-2 ring-[--brand]">
                <div data-media-entry-card-body="true"
                  class="media-entry-card__body aspect-[6/8] flex-none rounded-md object-cover object-center relative overflow-hidden select-none">
                  <div data-media-card-body-bottom-gradient="true"
                    class="z-[5] absolute inset-x-0 bottom-0 w-full opacity-90 to-40% h-[50%] bg-gradient-to-t from-[#0c0c0c] to-transparent">
                  </div>
                  <img data-media-entry-card-body-image="true" alt="${title}" loading="lazy"
                    decoding="async" data-nimg="fill"
                    class="object-cover object-center transition-transform group-hover/media-entry-card:scale-110"
                    src="${coverImage}"
                    style="position:absolute;height:100%;width:100%;inset:0;color:transparent;">
                </div>
              </a>
              <div data-media-entry-card-title-section="true"
                class="pt-2 space-y-1 flex flex-col justify-between h-full select-none">
                <div>
                  <p data-media-entry-card-title-section-title="true"
                    class="text-pretty font-medium min-[2000px]:font-semibold text-sm lg:text-[1rem] min-[2000px]:text-lg line-clamp-2">
                    ${title}</p>
                </div>
                <div>
                  <p data-media-entry-card-title-section-year-season="true"
                    class="text-sm text-[--muted] inline-flex gap-1 items-center">${year}</p>
                </div>
              </div>
            </div>
        </div>
        `;
        }

    setEvent() {
        this.$element.addEventListener("click", () => {
            this.router.navigateTo(`/comic/${this.id}`);
        });
    }
}
