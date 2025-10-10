import Component from "../core/components";

export default class MangaGenres extends Component {
    constructor(props) {
        super(props);
        this.genres = props.genres || [];
    }

    template() {
        return `
             <div class="flex flex-wrap gap-2 mb-6">
                ${this.genres.map(genre => `
                    <span class="inline-flex items-center font-bold uppercase rounded transition-colors duration-0  text-white px-2 py-1 text-xs text-white">
                        ${genre}
                    </span>
                `)}
            </div>
        `;
    }
}