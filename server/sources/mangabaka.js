// server.js
import axios from "axios";
axios.defaults.timeout = 30000; // all requests = 30 seconds

export class Mangabaka {
    constructor() {
        this.domain = "api.mangabaka.dev";
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
            const results = await this.sendRequest(`https://${this.domain}/v1/series/search?${query}`);
            return results;

        } catch (err) {
            console.error(err);
            return null;
        }
    }
    
    async getLatest() {
        try {
            const type = "manhua";
            const page = 1;
            const limit = 20;
            const sortby = "latest";
            const urlParams = `type=${type}&page=${page}&limit=${limit}&sort_by=${sortby}`;
            const results = await this.search(urlParams);
            return results;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async getPopular() {
        try {
            const type = "manhua";
            const page = 1;
            const limit = 20;
            const sortby = "popularity_asc";
            const urlParams = `type=${type}&page=${page}&limit=${limit}&sort_by=${sortby}`;
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
