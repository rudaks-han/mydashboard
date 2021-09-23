const Store = require('electron-store');
const { session } = require('electron');
const logger = require('electron-log');

class StoreMap {
    constructor() {
        this.store = new Store();
        logger.debug("storePath : " + this.store.path);
    }

    set(key, value) {
        this.store.set(key, value);
    }

    get(key) {
        return this.store.get(key);
    }

    clear() {
        this.store.clear();
    }

    getCookieAndStore(domain, storeName, callback) {
        session.defaultSession.cookies.get({'domain': domain})
            .then(cookies => {
                let cookieValue = {};
                cookies.map(cookie => {
                    cookieValue[cookie.name] = cookie.value;
                });

                this.store.set(storeName, cookieValue);

                callback(cookieValue);
            });
    }
}

module.exports = StoreMap;
