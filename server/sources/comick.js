// server.js
import axios from "axios";
axios.defaults.timeout = 30000; // all requests = 30 seconds

class Comick {
    constructor() {
        this.domain = "api.comick.dev";
    }

    async sendRequest(url) {
        try {
            let response = await axios.get(url, {
                headers: {
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                    "Referer": this.domain
                }
            });
            return response.data;
        } catch (err) {
            console.error("Request failed:", url, err.message);
            return null;
        }
    }

    async search(query) {
        try {
            const results = await this.sendRequest(`https://${this.domain}/v1.0/search?${query}`);
            console.log(results);
            return results;

        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async getLatest() {
        try {
            const country = "cn";
            const page = 1;
            const limit = 20;
            const sort = "uploaded";
            const urlParams = `country=${country}&page=${page}&limit=${limit}&sort=${sort}`;
            const results = await this.search(urlParams);
            return results;
        } catch (err) {
            return err;
        }
    }

    async getPopular() {
        try {
            const country = "cn";
            const page = 1;
            const limit = 20;
            const sort = "user_follow_count";
            // const genres = ["action", "wuxia", "adventure", "web-comic"];
            // const genresParam = genres.map(g => `genres=${g}`).join("&");
            const urlParams = `country=${country}&page=${page}&limit=${limit}&sort=${sort}`;
            const results = await this.search(urlParams);
            return results;

        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async getInfo(manga) {

    }

}
