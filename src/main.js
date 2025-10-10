// ✅ Auto-import all JS files from /assets/scripts
import.meta.glob(["./assets/styles/**/*.css"], {
    eager: true,
});

// src/main.js
import Router from "./router/router.js";
import MangaChapters from "./components/manga_chapter.js";
import MangaList from "./components/manga_list.js";
import MangaPage from "./components/manga_page.js";

const router = new Router([
    {
        path: /^\/$/,
        view: async (params) => {
            const $target = document.createElement("div");
            new MangaList({
                $element: $target,
                router
            });
            return $target;
        },
    },
    {
        path: /^\/comic\/(?<mangaId>[a-zA-Z0-9_-]+)$/,
        view: async (params) => {
            const $target = document.createElement("div");
            new MangaPage({
                $element: $target,
                router,
                mangaId: params.mangaId,
            });
            return $target;
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

