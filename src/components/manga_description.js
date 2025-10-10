import Component from "../core/components.js";

export default class MangaDescription extends Component {
    constructor(props) {
        super(props);
        this.router = props.router;
        this.description = props.description;
    }

    template() {
        // separate container div if different type
        return `
            <div class="hidden md:block mt-4">
                <p class="text-white text-base leading-relaxed">${this.description}</p>
            </div>
        `;
    }
}
