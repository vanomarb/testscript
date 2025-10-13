import Component from "../core/components.js";

export default class MangaCard extends Component {
    constructor(props) {
        super(props);
        this.router = props.router;
        this.id = props.id;
        this.translatedTitle = props.translatedTitle;
        this.title = props.title;
        this.genres = props.genres;
        this.year = props.year;
        this.coverImage = props.coverImage;
        this.type = props.type; // 'popular' or 'latest'
        this.chapter = props.chapter;
        this.time = props.time;
    }

    template() {
        const { id, translatedTitle, title, genres, type, year, coverImage, chapter, time } = this;

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
                    class="z-[5] absolute inset-x-0 bottom-0 w-full opacity-90 to-40% h-[80%] bg-gradient-to-t from-[#0c0c0c] to-transparent">
                  </div>
                  <img data-media-entry-card-body-image="true" alt="${title}" loading="lazy"
                    decoding="async" data-nimg="fill"
                    class="object-cover object-center transition-transform group-hover/media-entry-card:scale-110"
                    src="${coverImage}"
                    style="position:absolute;height:100%;width:100%;inset:0;color:transparent;">
                </div>
              </a>
              <div data-media-entry-card-title-section="true" class="space-y-1 flex flex-col h-full select-none pb-2 z-9 justify-end absolute left-0 right-0 px-2 pointer-events-none">
                <div>
                  <p data-media-entry-card-title-section-title="true"
                    class="text-pretty font-medium min-[2000px]:font-semibold text-xs line-clamp-2">
                    ${translatedTitle || title}</p>
                </div>
              </div>
            </div>
            ${type == 'hot updates' ? `<div class="flex h-full select-none pt-2 justify-between">
              <p data-media-entry-card-title-section-year-season="true" class="text-xs lg:text-sm text-white gap-1 items-center line-clamp-1 overflow-hidden max-h-[20px] max-w-[80px]">${chapter}</p>
              <p data-media-entry-card-title-section-year-season="true" class="text-xs lg:text-sm text-[#ffffff66] gap-1 items-center">${time}</p>
            </div>` : ''}
        </div>
        `;
        }

    setEvent() {
        this.$element.addEventListener("click", () => {
            this.router.navigateTo(`comic/${this.id}`);
        });
    }
}
