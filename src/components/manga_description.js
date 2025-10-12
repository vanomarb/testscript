import Component from "../core/components.js";

export default class MangaDescription extends Component {
    constructor(props) {
        super(props);
        this.router = props.router;
        this.translatedDescription = props.translatedDescription;
        this.description = props.description;
        this.isMobile = props.isMobile || false;
    }

    template() {
        // separate container div if different type
        return `
            <div class="${this.isMobile ? '' : 'hidden md:block'} mt-4">
                <p class="text-white text-base leading-relaxed">${this.translatedDescription || this.description}</p>
            </div>
        `;
    }
}
