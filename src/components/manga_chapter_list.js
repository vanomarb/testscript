import Component from "../core/components";
import moment from "moment/moment";

export default class MangaChapterList extends Component {
    constructor(props) {
        super(props);
        this.mangaId = props.mangaId;
        this.chapters = props.chapters || [];
    }

    template() {
        return `
            ${this.chapters.map((chapter, index) => `
            <div class="w-full pr-1 sm:pr-5 pl-3 sm:pl-4">    
                <div class="relative p-4 py-1.5 sm:py-3 backdrop-blur-sm w-full rounded-lg border border-white/30 cursor-pointer transition-all duration-0 bg-black/20 hover:shadow-md">
                    <a tabindex="0"
                        href="/comic/${this.mangaId}/chapter/${chapter.slug}?cid=${chapter.chapterId}&mid=${chapter.mangaId}">
                        <div class="flex flex-col gap-1 sm:gap-3">
                            <div class="flex items-center md:items-start space-x-4 sm:space-x-3"><img alt="US"
                                    class="w-6 h-6 flex-shrink-0"
                                    src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbDpzcGFjZT0icHJlc2VydmUiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTIiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cGF0aCBkPSJNMCA4NS4zMzFoNTEydjM0MS4zMzdIMHoiIHN0eWxlPSJmaWxsOiNkODAwMjciLz48cGF0aCBkPSJtMTc4LjkyMyAxODkuNTY3IDE0LjY1NiA0NS4xMDdoNDcuNDI5bC0zOC4zNzEgMjcuODc4IDE0LjY1NyA0NS4xMDktMzguMzcxLTI3Ljg3OS0zOC4zNzEgMjcuODc5IDE0LjY1Ni00NS4xMDktMzguMzcxLTI3Ljg3OGg0Ny40Mjl6TTI3MS4zIDMzOS41OTNsLTE0LjM5LTEwLjQ1NS0xNC4zODggMTAuNDU0IDUuNDk1LTE2LjkxNC0xNC4zODktMTAuNDU1aDE3Ljc4Nmw1LjQ5Ni0xNi45MTYgNS40OTggMTYuOTE2aDE3Ljc4NWwtMTQuMzg5IDEwLjQ1NHptMzcuNTM3LTUxLjY2NmgtMTcuNzg1bC01LjQ5NiAxNi45MTQtNS40OTYtMTYuOTEzLTE3Ljc4Ny0uMDAxIDE0LjM5MS0xMC40NTUtNS40OTgtMTYuOTE1IDE0LjM5IDEwLjQ1MyAxNC4zODktMTAuNDUzLTUuNDk2IDE2LjkxNXptMC02My44NjQtMTQuMzg4IDEwLjQ1NSA1LjQ5NSAxNi45MTQtMTQuMzg4LTEwLjQ1My0xNC4zOSAxMC40NTUgNS40OTgtMTYuOTE3LTE0LjM5MS0xMC40NTIgMTcuNzg4LS4wMDIgNS40OTUtMTYuOTE2IDUuNDk2IDE2LjkxNnpNMjcxLjMgMTcyLjM5N2wtNS40OTUgMTYuOTE2IDE0LjM4OCAxMC40NTMtMTcuNzg1LjAwMS01LjQ5OCAxNi45MTctNS40OTYtMTYuOTE4LTE3Ljc4NS4wMDIgMTQuMzg5LTEwLjQ1Ni01LjQ5Ni0xNi45MTYgMTQuMzg4IDEwLjQ1NXoiIHN0eWxlPSJmaWxsOiNmZmRhNDQiLz48L3N2Zz4=">
                                <div class="min-w-0 flex-1">
                                    <h4 class="text-white font-bold text-xs sm:text-sm sm:mb-2 truncate capitalize transition-colors duration-0">
                                        ${chapter.name}
                                    </h4>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-1 sm:flex sm:flex-row sm:items-start sm:gap-4 ml-3 text-xs sm:text-sm">
                                <div class="flex items-center space-x-1 sm:space-x-2"><svg xmlns="http://www.w3.org/2000/svg" width="24"
                                        height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round"
                                        class="lucide lucide-users w-2.5 sm:w-4 h-2.5 sm:h-4 text-white transition-colors duration-0"
                                        aria-hidden="true">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                        <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                    </svg><span class="text-white text-xs sm:text-sm truncate transition-colors duration-0">MTL</span>
                                </div>
                                <div class="flex items-center space-x-1 sm:space-x-2"><svg xmlns="http://www.w3.org/2000/svg" width="24"
                                        height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round"
                                        class="lucide lucide-clock w-2.5 sm:w-4 h-2.5 sm:h-4 text-white transition-colors duration-0"
                                        aria-hidden="true">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg><span class="text-white text-xs sm:text-sm transition-colors duration-0">${moment(chapter.updatedAt).format("LLL")}</span>
                                </div>
                                <div class="flex items-center space-x-1 sm:space-x-2"><svg xmlns="http://www.w3.org/2000/svg" width="24"
                                        height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round"
                                        class="lucide lucide-user w-2.5 sm:w-4 h-2.5 sm:h-4 text-white transition-colors duration-0"
                                        aria-hidden="true">
                                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg><span
                                        class="text-[#2ecc71] truncate max-w-[80px] sm:max-w-xs text-xs sm:text-sm transition-colors duration-0">SYSTEM</span>
                                </div>
                                <div class="flex items-center space-x-1 sm:space-x-2"><svg xmlns="http://www.w3.org/2000/svg" width="24"
                                        height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                        stroke-linecap="round" stroke-linejoin="round"
                                        class="lucide lucide-layers w-2.5 sm:w-4 h-2.5 sm:h-4 text-white transition-colors duration-0"
                                        aria-hidden="true">
                                        <path
                                            d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z">
                                        </path>
                                        <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"></path>
                                        <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"></path>
                                    </svg><span class="text-white text-xs sm:text-sm transition-colors duration-0">Unknown</span>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
            </div>    
            `).join("")}
        `;
    }
}