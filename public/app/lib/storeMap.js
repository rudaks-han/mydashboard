const Store = require('electron-store');
const { session } = require('electron');

class StoreMap {
    constructor() {
        this.store = new Store();

        console.log(this.store.path);
    }

    set(key, value) {
        this.store.set(key, value);
    }

    get(key) {
        return this.store.get(key);
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