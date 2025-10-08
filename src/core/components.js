// src/core/Component.js
export default class Component {
  constructor(props) {
    Object.assign(this, props);
    this.setup?.();
    this.render?.();
    this.setEvent?.();

    this.API_URL = import.meta.env.VITE_API_URL;
    this.isProd = process.env.NODE_ENV === 'production';

    // Automatically call mounted() after render
    if (typeof this.mounted === "function") {
      this.mounted();
    }
  }

  setup() { }
  template() { return ''; }
  setEvent() { }
  render() {
    this.$element.innerHTML = this.template();
  }
}
