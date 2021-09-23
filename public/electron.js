const { app, ipcMain } = require('electron');
const autoUpdater = require('./autoUpdater');
const CookieConst = require('./app/const/cookieConst');
const MainWindow = require('./mainWindow');
const LoginClient = require('./app/client/loginClient');
const JiraClient = require('./app/client/jiraClient');
const DaouofficeClient = require('./app/client/daouofficeClient');
const JenkinsClient = require('./app/client/jenkinsClient');
const SonarqubeClient = require('./app/client/sonarqubeClient');
const VictoryPortalClient = require('./app/client/victoryPortalClient');
const OutlookClient = require('./app/client/outlookClient');
const StoreMap = require('./app/lib/storeMap');
const storeMap = new StoreMap();
const logger = require('electron-log');
logger.transports.file.level = 'info';
logger.transports.console.level = 'info';

let mainWindow;
let loginClient;
let daouofficeClient;
let jiraClient;
let jenkinsClient;
let sonarqubeClient;
let victoryPortalClient;
let outlookClient;

app.whenReady().then(() => {
    setTimeout(autoUpdater, 3000);

    mainWindow = new MainWindow('https://spectra.daouoffice.com/login', storeMap);

    loginClient = new LoginClient(mainWindow);
    jiraClient = new JiraClient(mainWindow);
    daouofficeClient = new DaouofficeClient(mainWindow);
    jenkinsClient = new JenkinsClient(mainWindow);
    sonarqubeClient = new SonarqubeClient(mainWindow);
    victoryPortalClient = new VictoryPortalClient(mainWindow);
    outlookClient = new OutlookClient(mainWindow);

    if (loginClient.isAuthenticated()) {
        mainWindow.load('index.html', true);
    }

    mainWindow.webContents.on('did-finish-load', e => {
        const url = e.sender.getURL();
        logger.info('[mainWindow] did-finish-load: ' + url);
        logger.info('isAuthenticated(): ' + loginClient.isAuthenticated());

        if (!loginClient.isAuthenticated()) {
            if (url.indexOf('https://spectra.daouoffice.com/app/home') > -1) {
                storeMap.getCookieAndStore('spectra.daouoffice.com', CookieConst.daouoffice_for_app, (cookieValue) => {
                    mainWindow.load('index.html', true)
                });

                // daouoffice에도 로그인
                storeMap.getCookieAndStore('spectra.daouoffice.com', CookieConst.daouoffice, (cookieValue) => {});
            } else if (url.indexOf('https://spectra.daouoffice.com/login') > -1) {
                const daouofficeCookieData = storeMap.get(CookieConst.daouoffice_for_app);
                if (daouofficeCookieData) {
                    mainWindow.load('index.html', true);
                }
            }
        }
    });

    mainWindow.once('ready-to-show', () => mainWindow.show());
    mainWindow.on('closed', () => {
        logger.info('[mainWindow] closed');
        mainWindow = null;
    });
})

app.on('window-all-closed', () => {
    logger.info('[app] window-all-closed');
    app.quit()
})

ipcMain.on(`logout`, (event, data) => {
    logger.info('logout');
    storeMap.set(CookieConst.daouoffice_for_app, '');
    mainWindow.load('https://spectra.daouoffice.com/login');
});

ipcMain.on(`goLoginPage`, (event, data) => {
    storeMap.set(CookieConst.daouoffice_for_app, '');
    mainWindow.load('https://spectra.daouoffice.com/login');
});

ipcMain.on(`saveComponentSort`, (event, data) => {
    logger.info('saveComponentSort');
    storeMap.set(CookieConst.component_sort, data);
});

ipcMain.on(`findComponentSort`, () => {
    const components = storeMap.get(CookieConst.component_sort);
    mainWindow.webContents.send('findComponentSortCallback', components);
});

ipcMain.on(`findStore`, (e, data) => {
    if (!data || !data.key) {
        logger.warn('findStore: key not exists');
        return;
    }

    const key = data.key;
    const response = storeMap.get(key);
    mainWindow.webContents.send('findStoreCallback', response);
});

ipcMain.on(`saveStore`, (e, data) => {
    if (!data || !data.key) {
        logger.warn('findStore: key not exists');
        return;
    }

    const key = data.key;
    const value = data.value;

    storeMap.set(key, value);
});
