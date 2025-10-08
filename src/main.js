// ✅ Auto-import all JS files from /assets/scripts
import.meta.glob(["./assets/styles/**/*.css"], {
    eager: true,
});

// src/main.js
import Router from "./router/router.js";
import MangaChapters from "./components/manga_chapter.js";

const router = new Router([
    {
        path: /^\/$/, // home route
        view: async () => {
            const div = document.createElement("div");
            div.innerHTML = "<h1>Home Page</h1><p>Select a manga.</p>";
            return div;
        },
    },
    {
        path: /^\/comic\/chapter\/(?<mangaId>[a-zA-Z0-9_-]+)\/(?<section>[0-9]+)_(?<chapter>[0-9]+)$/,
        view: (params) => {
            const $target = document.createElement('div');
            const classNames = 'mx-auto mt-8 flex flex-col items-center justify-center min-h-screen';
            $target.classList.add(...classNames.split(" "));
            $target.id = 'comic-images-container';
            new MangaChapters({
                $element: $target,
                router,
                mangaId: params.mangaId,
                section: params.section,
                chapter: params.chapter,
            });
            return $target;
        },
    },

]);

router.loadRoute();
