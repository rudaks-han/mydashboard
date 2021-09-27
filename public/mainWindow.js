const electron = require('electron');
const { BrowserWindow, shell, Menu, Tray } = electron;
const windowStateKeeper = require('electron-window-state')
const path = require('path');
const logger = require('electron-log'); // /Users/macbookpro/Library/Logs/my-dashboard
const fs = require('fs');

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
        this.webContents.on('new-window', function(e, url) {
            e.preventDefault();
            shell.openExternal(url);
        });
    }

    load(url, authenticated = false) {
        const envMode = process.env.mode;
        logger.debug('------------- mainWindow#load -----------------');
        logger.info('# __dirname : ' + __dirname);
        logger.info('# url : ' + url);
        logger.info('# authenticated : ' + authenticated)
        logger.info('# envMode : ' + envMode)
        this.authenticated = authenticated;
        if (envMode === 'dev') {
            this.webContents.openDevTools();
        }

        if (url.startsWith('http')) {
            logger.info('# loadURL : ' + url);
            this.loadURL(url);
        } else {
            if (envMode === 'dev') {
                const path = 'http://localhost:3000';
                logger.info('# loadURL : ' + path);
                this.loadURL(path);
            } else {
                const path = `${path.join(__dirname, '../build/index.html')}`;
                logger.info('# loadFile : ' + path);
                logger.info('# fileExists : ' + fs.exists(path));
                this.loadFile(path);
            }
        }

        logger.info('------------------------------');
    }

    createTray() {
        this.tray = new Tray(`${__dirname}/trayTemplate.png`)
        this.tray.setToolTip('Tray details')

        this.tray.on('click', e => {
            if (e.shiftKey) {
                app.quit()
            } else {
                this.isVisible() ? this.hide() : this.show()
            }
        })

        let trayMenu = Menu.buildFromTemplate([
            {role: 'quit'}
        ]);

        this.tray.setContextMenu(trayMenu)
    }
}

module.exports = MainWindow;

