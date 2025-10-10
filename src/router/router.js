// src/router/router.js
export default class Router {
  constructor(routes) {
    this.routes = routes;
    window.addEventListener("popstate", () => this.loadRoute());
    document.addEventListener("click", (e) => {
      const link = e.target.closest("[data-link]");
      if (link) {
        e.preventDefault();
        history.pushState({}, "", link.href);
        this.loadRoute();
      }
    });
  }

  matchRoute(pathname) {
    for (const route of this.routes) {
      const match = pathname.match(route.path);
      if (match) return { route, params: match.groups || {} };
    }
    return null;
  }

  async loadRoute() {
    const match = this.matchRoute(window.location.pathname);
    const app = document.getElementById("app");

    if (!match) {
      app.innerHTML = "<h1>404 Not Found</h1>";
      return;
    }
    const view = await match.route.view(match.params);
    app.innerHTML = "";
    app.appendChild(view);
  }

  navigateTo(url) {
    history.pushState({}, "", url);
    this.loadRoute();
  }
}
