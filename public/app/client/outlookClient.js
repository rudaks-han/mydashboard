const { BrowserWindow, session, shell } = require('electron');
const axios = require('axios');
const ShareUtil = require('../lib/shareUtil');
const BaseClientComponent = require('./baseClientComponent');
const CookieConst = require('../const/cookieConst');
const fs = require('fs');

class OutlookClient extends BaseClientComponent {
    constructor(mainWindow) {
        super('outlook', mainWindow);
        this.storeId = CookieConst.outlook;
        this.bindIpcMainListener();
    }

    bindIpcMainListener() {
        this.ipcMainListener.on('findList', this.findList.bind(this));
        this.ipcMainListener.on('openLoginPage', this.openLoginPage.bind(this));
        this.ipcMainListener.on('logout', this.logout.bind(this));
        this.ipcMainListener.on('openOutlook', this.openOutlook.bind(this));
    }

    async findList() {
        const _this = this;
        const data = {};

        try {
            const response = await axios.post(`https://mail.spectra.co.kr/owa/sessiondata.ashx?appcacheclient=0`, data, _this.getAxiosConfig(CookieConst.outlook));
            const inbox = response.data.findFolders.Body.ResponseMessages.Items[0].RootFolder.Folders.filter(folder => folder.DisplayName === '받은 편지함')[0];
            const unreadCount = inbox.UnreadCount;
            const conversations = response.data.findConversation.Body.Conversations;
            _this.mainWindowSender.send('authenticated', true);
            _this.mainWindowSender.send('findListCallback', { conversations, unreadCount });
        } catch (e) {
            ShareUtil.printAxiosError(e);
            _this.mainWindowSender.send('authenticated', false);
            _this.mainWindowSender.send('findListCallback', { conversations: [], unreadCount: 0 });
        }
    }

    openLoginPage() {
        const _this = this;
        let loginWindow = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true,
                contextIsolation : false
            },
            width: 800,
            height: 600
        })

        loginWindow.loadURL('https://mail.spectra.co.kr/owa/auth/logon.aspx');
        loginWindow.webContents.on('did-finish-load', e => {
            const url = e.sender.getURL();
            if (url.endsWith('/owa/')) {
                this.getCookieAndStore('mail.spectra.co.kr', CookieConst.outlook, () => {
                    loginWindow.close();
                    loginWindow = null;
                    _this.findList();
                });
            }

        })
        //loginWindow.webContents.openDevTools();
    }

    logout() {
        const _this = this;
        this.storeMap.set(_this.storeId, '');
        _this.findList();
    }

    outlookPaths() {
        return {
            windows: [
                'C:\\Program Files\\Microsoft Office\\Office16\\OUTLOOK.EXE', // office 2016
                'C:\\Program Files\\Microsoft Office\\Office15\\OUTLOOK.EXE', // office 2013
                'C:\\Program Files\\Microsoft Office\\Office14\\OUTLOOK.EXE', // office 2010
                'C:\\Program Files\\Microsoft Office\\Office12\\OUTLOOK.EXE', // office 2007
            ],
            mac: [
                '/Applications/Microsoft\ Outlook.app'
            ]
        };
    }

    openOutlook() {
        let outlookPath = ''; // mac
        if (process.platform === 'darwin') { // windows
            this.outlookPaths().mac.map(path => {
                if (fs.existsSync(path)) {
                    outlookPath = path;
                    return;
                }
            })
        } else { // window
            this.outlookPaths().windows.map(path => {
                if (fs.existsSync(path)) {
                    outlookPath = path;
                    return;
                }
            })
        }

        if (outlookPath === '') {
            alert('outlook does not exists')
            return;
        }
        shell.openPath(outlookPath);
    }
}

module.exports = OutlookClient;
