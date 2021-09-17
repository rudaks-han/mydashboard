const electron = require('electron');
const { BrowserWindow, shell, Menu, Tray } = electron;
const windowStateKeeper = require('electron-window-state')
const path = require('path');
const ShareUtil = require('./app/lib/shareUtil');
const logger = require('electron-log'); // /Users/macbookpro/Library/Logs/my-dashboard
let mainMenu = Menu.buildFromTemplate(require('./mainMenu'))

class MainWindow extends BrowserWindow {
    constructor(url, storeMap) {
        let winState = windowStateKeeper({
            defaultWidth: 1280, defaultHeight: 800
        })

        console.log(__dirname)
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
        logger.info('------------- mainWindow#load -----------------');
        logger.info('# __dirname : ' + __dirname);
        logger.info('# url : ' + url);
        logger.info('# process.env.mode : ' + process.env.mode)
        this.authenticated = authenticated;
        if (process.env.mode === 'dev') {
            this.webContents.openDevTools();
        }

        if (url.startsWith('http')) {
            logger.info('# loadURL : ' + url);
            this.loadURL(url);
        } else {
            if (process.env.mode === 'dev') {
                logger.info('# loadURL : ' + 'http://localhost:3000');
                this.loadURL('http://localhost:3000');


            } else {
                logger.info('# loadURL : ' + `${path.join(__dirname, '../build/index.html')}`);
                this.loadFile(`${path.join(__dirname, '../build/index.html')}`);
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

