// src/core/Component.js
export default class Component {
  constructor(props) {
    Object.assign(this, props);
    this.state = this.state || {}; // ensure state object exists
    this.setup?.();
    this.render?.();
    this.setEvent?.();

    this.state = this.state || {}; // ensure state object exists
    this.API_URL = import.meta.env.VITE_API_URL;
    this.isProd = process.env.NODE_ENV === 'production';

    // Automatically call mounted() after render
    if (typeof this.mounted === "function") {
      this.mounted();
    }
  }
  /**
   * Simple reactive state system.
   * Merges new state, triggers re-render, then calls callback after.
   */
  setState(newState, callback, { skipRender = false } = {}) {
    this.state = { ...this.state, ...newState };
    if (!skipRender) this.render();
    if (callback) callback();
  }


  setup() { }
  template() { return ''; }
  render() {
    if (!this.$element) {
      console.warn("⚠️ Component has no root element!");
      return;
    }
    this.$element.innerHTML = this.template?.() || "";
    this.afterRender?.();
  }
  setEvent() { }
}
