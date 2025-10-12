import Component from "../core/components";

export default class MangaGenres extends Component {
    constructor(props) {
        super(props);
        this.genres = props.genres || [];
    }

    template() {
        return `
             <div class="flex flex-wrap gap-2 mt-4 mb-6">
                ${this.genres.map(genre => `
                    <span class="inline-flex items-center font-bold uppercase rounded transition-colors duration-0 text-white px-2 py-1 text-xs bg-gray-700/60 text-white/90 hover:bg-gray-600/60 bg-gray-600/40">
                        ${genre}
                    </span>
                `).join("").replace(" , ", "").replace("#", "")}
            </div>
        `;
    }
}