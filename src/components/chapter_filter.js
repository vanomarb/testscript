import Component from "../core/components";

export default class ChapterFilter extends Component {
    constructor(props) {
        super(props);
    }

    template() {
        return `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2 sm:gap-4 space-y-3 sm:space-y-2 w-full pr-1 sm:pr-5 pl-3 sm:pl-4">
                <div class="flex flex-row justify-between w-full gap-2 sm:hidden">
                <button class="flex items-center justify-center gap-1 px-4 py-3 rounded font-bold text-xs transition-all duration-0 bg-gray-800 text-white hover:bg-gray-700" aria-pressed="false" aria-label="Toggle filters" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-funnel w-4 h-4" aria-hidden="true">
                    <path d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"></path>
                    </svg> Filters <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-4 h-4 transition-transform duration-0" aria-hidden="true">
                    <path d="m6 9 6 6 6-6"></path>
                    </svg>
                </button>
                <button class="flex items-center justify-center gap-1 px-4 py-3 rounded font-bold text-xs transition-all duration-0 bg-gray-800 text-white hover:bg-gray-700" aria-pressed="false" aria-label="Toggle reading history panel" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-history w-4 h-4" aria-hidden="true">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                    <path d="M12 7v5l4 2"></path>
                    </svg> History <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down w-3 h-3 transition-transform duration-0" aria-hidden="true">
                    <path d="m6 9 6 6 6-6"></path>
                    </svg>
                </button>
                </div>
                <div class="flex flex-col sm:flex-row sm:items-center space-y-1 md:space-y-0 sm:space-x-4 transition-all duration-0 hidden sm:flex w-full sm:w-auto">
                <div class="relative w-full sm:w-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search absolute left-2 z-10 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 text-yellow-400 transition-colors duration-0" aria-hidden="true">
                    <path d="m21 21-4.34-4.34"></path>
                    <circle cx="11" cy="11" r="8"></circle>
                    </svg>
                    <input placeholder="Search chapters..." class="bg-gray-600/30 text-white rounded px-6 sm:px-8 py-1.5 sm:py-2 w-full sm:min-w-[200px] focus:outline-none text-sm sm:text-base border border-white/30 transition-all duration-0 focus:ring-2 focus:ring-purple-500" aria-label="Search chapters" spellcheck="false" type="search" value="">
                </div>
                <div class="flex flex-row w-full md:w-fit gap-1 sm:gap-4">
                    <div class="relative w-full md:w-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-languages absolute left-2 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 text-yellow-400 transition-colors duration-0" aria-hidden="true">
                        <path d="m5 8 6 6"></path>
                        <path d="m4 14 6-6 2-3"></path>
                        <path d="M2 5h12"></path>
                        <path d="M7 2h1"></path>
                        <path d="m22 22-5-10-5 10"></path>
                        <path d="M14 18h6"></path>
                    </svg>
                    <select class="bg-gray-600/30 text-white rounded px-6 sm:px-8 py-1.5 sm:pt-1.5 sm:pb-2.5 w-full sm:w-auto cursor-pointer focus:outline-none text-sm sm:text-base border border-white/30 transition-all duration-0" aria-label="Filter by language">
                        <option value="all" class="bg-black text-white">Select translation</option>
                        <option value="en" class="bg-black text-white">English</option>
                        <option value="he" class="bg-black text-white">Hebrew</option>
                        <option value="ka" class="bg-black text-white">Georgian</option>
                        <option value="ms" class="bg-black text-white">Malay</option>
                        <option value="pt-br" class="bg-black text-white">Portuguese (Brazil)</option>
                    </select>
                    </div>
                    <div class="relative w-full md:w-fit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-down absolute left-2 top-1/2 -translate-y-1/2 w-3 sm:w-4 h-3 sm:h-4 text-yellow-400 transition-colors duration-0" aria-hidden="true">
                        <path d="m21 16-4 4-4-4"></path>
                        <path d="M17 20V4"></path>
                        <path d="m3 8 4-4 4 4"></path>
                        <path d="M7 4v16"></path>
                    </svg>
                    <select class="bg-gray-600/30 text-white rounded px-6 sm:px-8 py-1.5 sm:pt-1.5 sm:pb-2.5 w-full sm:w-auto cursor-pointer focus:outline-none text-sm sm:text-base border border-white/30 transition-all duration-0" aria-label="Sort order">
                        <option value="descending" class="bg-black text-white">Newest First</option>
                        <option value="ascending" class="bg-black text-white">Oldest First</option>
                    </select>
                    </div>
                </div>
                <button disabled="" class="px-2 sm:px-3 min-w-fit py-1.5 sm:py-2.5 rounded text-xs sm:text-sm font-semibold transition-all duration-0 w-full sm:w-auto bg-gray-700 text-gray-400 cursor-not-allowed" aria-disabled="true">Reset Filters</button>
                </div>
            </div>
        `;
    }
}