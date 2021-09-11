const { session } = require('electron');
const IpcMainListener = require('../lib/ipcMainListener');
const MainWindowSender = require('../lib/mainWindowSender');
const Request = require('../lib/request');

class BaseClientComponent {
    constructor(componentName, mainWindow) {
        this.componentName = componentName;
        this.mainWindow = mainWindow;
        this.storeMap = mainWindow.storeMap;
        this.ipcMainListener = new IpcMainListener(this.componentName);
        this.mainWindowSender = new MainWindowSender(this.mainWindow, this.componentName);
        this.request = new Request();
    }

    getStore() {
        return this.storeMap;
    }

    getCookieAndStore(domain, storeName, callback) {
        session.defaultSession.cookies.get({'domain': domain})
            .then(cookies => {
                let cookieValue = {};
                cookies.map(cookie => {
                    cookieValue[cookie.name] = cookie.value;
                });

                this.storeMap.set(storeName, cookieValue);
                callback(cookieValue);
            });
    }

    resetStore(storeName, callback) {
        this.storeMap.set(storeName, '');
        if (callback) {
            callback();
        }
    }

    getCookieDataString(name) {
        const cookieData = this.storeMap.get(name);

        let cookieDataString = '';
        for (let key in cookieData) {
            cookieDataString += key + '=' + cookieData[key] + ';';
        }

        return cookieDataString;
    }

    getAxiosConfig(storeName) {
        const cookieDataString = this.getCookieDataString(storeName);
        return {
            headers: {
                Cookie: `${cookieDataString}`
            }
        };
    }
}

module.exports = BaseClientComponent;