const electron = require('electron');
const { ipcMain } = electron;
const ShareUtil = require('../lib/shareUtil');

class IpcMainListener {
    constructor(componentName) {
        this.componentName = componentName;
    }

    on(name, callback) {
        ipcMain.on(`${this.componentName}.${name}`, (event, data) => {
            //ShareUtil.println(`[IpcMainListener] ${this.componentName}.${name}`);
            callback(event, data);
        });
    }
}

module.exports = IpcMainListener;