const electron = require('electron');
const { BrowserWindow, shell, Menu } = electron;
const windowStateKeeper = require('electron-window-state')
const path = require('path');
const ShareUtil = require('./app/lib/shareUtil');
const logger = require('electron-log'); // /Users/macbookpro/Library/Logs/my-dashboard
let mainMenu = Menu.buildFromTemplate(require('./mainMenu'))
//const FirebaseApp = require('../src/firebaseApp');
//import FirebaseApp from './firebaseApp';
//const firebaseApp = new FirebaseApp();

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
        });

        this.storeMap = storeMap;
        this.load(url);
        winState.manage(this);
        Menu.setApplicationMenu(mainMenu);
        //this.startTimer();

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

    startTimer() {
        //const interval = 1000 * 60;
        const interval = 1000 * 2;
        setInterval(() => {
            if (!this.authenticated) {
                console.log('startTimer: unauthorized');
                return;
            }
            const year = ShareUtil.getCurrYear();
            const month = Number(ShareUtil.getCurrMonth());
            const day = Number(ShareUtil.getCurrDay());
            const hour = Number(ShareUtil.getCurrHour());
            const minute = Number(ShareUtil.getCurrMinute());
            const second = Number(ShareUtil.getCurrSecond());

            this.webContents.send(
                'mainWindow.polling',
                {year, month, day, hour, minute, second}
            );

            console.log('polling: ' + JSON.stringify({year, month, day, hour, minute, second}));
        }, interval);
    }
}

module.exports = MainWindow;

