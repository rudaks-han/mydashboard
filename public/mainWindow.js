const electron = require('electron');
const { BrowserWindow, shell, Menu, Tray, nativeImage } = electron;
const windowStateKeeper = require('electron-window-state')
const path = require('path');
const logger = require('electron-log'); // /Users/macbookpro/Library/Logs/my-dashboard

let mainMenu = Menu.buildFromTemplate(require('./mainMenu'))

class MainWindow extends BrowserWindow {
    constructor(url, storeMap) {
        let winState = windowStateKeeper({
            defaultWidth: 1280, defaultHeight: 800
        })

        super({
            webPreferences: {
                nodeIntegration: true,
                contextIsolation : false,
                enableRemoteModule: true,
                preload: __dirname + '/preload.js'
            },
            width: winState.width, height: winState.height,
            x: winState.x, y: winState.y,
            icon: path.join(__dirname, "static/icons/png/1024x1024.png")
            //icon: path.join(__dirname, "static/icons/mac/icon.icns")
        });

        this.storeMap = storeMap;
        this.load(url);
        winState.manage(this);

        Menu.setApplicationMenu(mainMenu);

        this.createTray();

        //this.maximize();
        //this.webContents.openDevTools();
        this.webContents.on('new-window', function(event, url) {
            event.preventDefault();
            shell.openExternal(url);
        });
    }

    load(url, authenticated = false) {
        let envMode = process.env.mode;
        if (!envMode) {
            envMode = 'production';
        }
        logger.info('------------- mainWindow#load -----------------');
        logger.info('# __dirname : ' + __dirname);
        logger.info('# url : ' + url);
        logger.info('# authenticated : ' + authenticated)
        logger.info('# envMode : ' + envMode)
        logger.info('# version : ' + process.env.npm_package_version)
        this.authenticated = authenticated;
        if (envMode === 'dev') {
            this.webContents.openDevTools();
        }

        if (url.startsWith('http')) {
            this.loadURL(url);
        } else {
            if (envMode === 'dev') {
                const url = 'http://localhost:3000';
                logger.info('# loadURL : ' + url);
                this.loadURL(url);
            } else {
                const filePath = path.join(__dirname, '../build/index.html');
                logger.info('# filePath : ' + filePath);
                this.loadFile(filePath);
            }
        }

        logger.info('------------------------------');
    }

    createTray() {
        const image = nativeImage.createFromPath(
            path.join(__dirname, "tray_icon.png")
        );
        this.tray = new Tray(image.resize({width: 16, height: 16}));
        this.tray.setToolTip('My Dashboard');

        this.tray.on('click', event => {
            if (event.shiftKey) {
                app.quit()
            } else {
                this.isVisible() ? this.hide() : this.show()
            }
        })

        let trayMenu = Menu.buildFromTemplate([
            {role: 'quit'}
        ]);

        this.tray.setContextMenu(trayMenu);
    }
}

module.exports = MainWindow;

