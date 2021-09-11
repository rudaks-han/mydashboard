const ShareUtil = require('../lib/shareUtil');

class MainWindowSender {
    constructor(mainWindow, componentName) {
        this.mainWindow = mainWindow;
        this.componentName = componentName;
    }

    send(name, data) {
        //ShareUtil.println(`[MainWindowSender] ${this.componentName}.${name}`);
        this.mainWindow.webContents.send(
            `${this.componentName}.${name}`,
            data
        );
    }
}

module.exports = MainWindowSender;