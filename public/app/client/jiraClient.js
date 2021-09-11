const { BrowserWindow, session } = require('electron');
const axios = require('axios');
const ShareUtil = require('../lib/shareUtil');
const BaseClientComponent = require('./baseClientComponent');
const CookieConst = require('../const/cookieConst');

class JiraClient extends BaseClientComponent {
    constructor(mainWindow) {
        super('jira', mainWindow);
        this.bindIpcMainListener();
    }

    bindIpcMainListener() {
        this.ipcMainListener.on('findList', this.findList.bind(this));
        this.ipcMainListener.on('openLoginPage', this.openLoginPage.bind(this));
        this.ipcMainListener.on('logout', this.openLogoutPage.bind(this));
    }

    async findList() {
        const _this = this;
        const count = 10;
        const data = {"operationName":"jira_NavigationActivity","query":"\nfragment NavigationActivityItem on ActivitiesItem {\n  id\n  timestamp\n  object {\n    id\n    name\n    localResourceId\n    type\n    url\n    iconUrl\n    containers {\n      name\n      type\n    }\n    extension {\n      ... on ActivitiesJiraIssue {\n        issueKey\n      }\n    }\n  }\n}\n\nquery jira_NavigationActivity($first: Int, $cloudID: ID!) {\n  activities {\n    myActivities {\n      workedOn(first: $first, filters: [{type: AND, arguments: {cloudIds: [$cloudID], products: [JIRA, JIRA_BUSINESS, JIRA_SOFTWARE, JIRA_OPS]}}]) {\n        nodes {\n          ...NavigationActivityItem\n        }\n      }\n    }\n  }\n}\n\n","variables":{"first":count,"cloudID":"431d1acd-ee73-4c56-b41f-d9cfeb440064"}};

        try {
            const response = await axios.post(`https://enomix.atlassian.net/gateway/api/graphql`, data, _this.getAxiosConfig(CookieConst.jira));
            const items = response.data.data.activities.myActivities.workedOn.nodes;
            _this.mainWindowSender.send('authenticated', true);
            _this.mainWindowSender.send('findListCallback', items);
        } catch (e) {
            ShareUtil.printAxiosError(e);
            _this.mainWindowSender.send('authenticated', false);
            _this.mainWindowSender.send('findListCallback', []);
        }
    }

    openLoginPage() {
        const _this = this;
        let ses = session.defaultSession;

        let loginWindow = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true,
                contextIsolation : false
            },
            width: 800,
            height: 600
        })

        loginWindow.loadURL('https://id.atlassian.com/login');
        loginWindow.webContents.on('did-finish-load', e => {
            const url = e.sender.getURL();
            if (url.startsWith('https://id.atlassian.com/login/authorize')) {
                this.getCookieAndStore('id.atlassian.com', CookieConst.jira, () => {
                    loginWindow.close();
                    loginWindow = null;
                    _this.findList();
                });
            }
        })
        //loginWindow.webContents.openDevTools();
    }

    openLogoutPage() {
        const _this = this;
        this.getStore().set(CookieConst.jira, '');

        let loginWindow = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true,
                contextIsolation : false
            },
            width: 800,
            height: 600
        })
        loginWindow.loadURL('https://id.atlassian.com/logout?continue=https%3A%2F%2Fenomix.atlassian.net');
        loginWindow.webContents.on('did-finish-load', e => {
            session.defaultSession.cookies.get({'name': 'cloud.session.token', 'domain': 'id.atlassian.com'})
                .then(cookies => {
                    if (cookies.length === 0) {
                        loginWindow.close();
                        loginWindow = null;

                        _this.findList();
                    }
                });

        });
        //loginWindow.webContents.openDevTools();
    }
}

module.exports = JiraClient;
