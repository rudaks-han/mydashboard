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
        this.ipcMainListener.on('findRecentJobList', this.findRecentJobList.bind(this));
        this.ipcMainListener.on('findAssignToMeList', this.findAssignToMeList.bind(this));
        this.ipcMainListener.on('findRecentProjectList', this.findRecentProjectList.bind(this));
        this.ipcMainListener.on('openLoginPage', this.openLoginPage.bind(this));
        this.ipcMainListener.on('logout', this.openLogoutPage.bind(this));
    }

    async findRecentJobList() {
        const _this = this;
        const count = 10;
        const data = {"operationName":"jira_NavigationActivity","query":"\nfragment NavigationActivityItem on ActivitiesItem {\n  id\n  timestamp\n  object {\n    id\n    name\n    localResourceId\n    type\n    url\n    iconUrl\n    containers {\n      name\n      type\n    }\n    extension {\n      ... on ActivitiesJiraIssue {\n        issueKey\n      }\n    }\n  }\n}\n\nquery jira_NavigationActivity($first: Int, $cloudID: ID!) {\n  activities {\n    myActivities {\n      workedOn(first: $first, filters: [{type: AND, arguments: {cloudIds: [$cloudID], products: [JIRA, JIRA_BUSINESS, JIRA_SOFTWARE, JIRA_OPS]}}]) {\n        nodes {\n          ...NavigationActivityItem\n        }\n      }\n    }\n  }\n}\n\n","variables":{"first":count,"cloudID":"431d1acd-ee73-4c56-b41f-d9cfeb440064"}};

        try {
            const response = await axios.post(`https://enomix.atlassian.net/gateway/api/graphql`, data, _this.getAxiosConfig(CookieConst.jira));
            let items = [];
            response.data.data.activities.myActivities.workedOn.nodes.map(node => {
                const id = node.id;
                const issueKey = node.object.extension.issueKey;
                const containerName = node.object.containers[1].name
                const timestamp = node.timestamp;
                const name = node.object.name;
                const type = node.object.type;
                const url = node.object.url;
                const iconUrl = node.object.iconUrl;

                items.push({
                    id,
                    issueKey,
                    containerName,
                    timestamp,
                    name,
                    type,
                    url,
                    iconUrl
                })
            });

            _this.mainWindowSender.send('authenticated', true);
            _this.mainWindowSender.send('findRecentJobListCallback', items);
        } catch (e) {
            ShareUtil.printAxiosError(e);
            _this.mainWindowSender.send('authenticated', false);
            _this.mainWindowSender.send('findRecentJobListCallback', []);
        }
    }

    async findAssignToMeList() {
        const _this = this;
        const count = 10;
        const data = {"operationName":"navigationAssignedIssuesQuery","query":"query navigationAssignedIssuesQuery($first: Int!, $jql: String, $useIssueService: Boolean!) {\n    issues(first: $first, jql: $jql, useIssueService: $useIssueService) {\n      edges {\n        node {\n          issueId\n          issuekey {\n            stringValue\n          }\n          summary {\n            textValue\n          }\n          project {\n            id\n            name\n          }\n          status {\n            statusCategoryId\n            name\n          }\n          issuetype {\n            id\n            name\n            iconUrl\n          }\n        }\n      }\n      totalCount\n    }\n  }","variables":{"first":20,"jql":"assignee = currentUser() AND statusCategory != 3 ORDER BY statusCategory DESC, updatedDate DESC","useIssueService":true}};

        try {
            const response = await axios.post(`https://enomix.atlassian.net/rest/gira/1/`, data, _this.getAxiosConfig(CookieConst.jira));
            let items = [];
            response.data.data.issues.edges.map(edge => {
                const node = edge.node;
                const issueId = node.issueId;
                const issueKey = node.issuekey.stringValue;
                const summary = node.summary.textValue;
                const projectName = node.project.name;
                const iconUrl = node.issuetype.iconUrl;

                items.push({
                    issueId,
                    issueKey,
                    summary,
                    projectName,
                    iconUrl
                });
            });
            _this.mainWindowSender.send('findAssignToMeListCallback', items);
        } catch (e) {
            ShareUtil.printAxiosError(e);
            _this.mainWindowSender.send('findAssignToMeListCallback', []);
        }
    }

    async findRecentProjectList() {
        const _this = this;
        const count = 10;

        try {
            const response = await axios.get(`https://enomix.atlassian.net/rest/internal/2/productsearch/search?counts=projects%3D5&type=projects`, _this.getAxiosConfig(CookieConst.jira));
            //const items = response.data.data.activities.myActivities.workedOn.nodes;
            let items = [];
            if (response.data.length) {
                response.data[0].items.map(item => {
                    const id = item.id;
                    const title = item.title;
                    const metadata = item.metadata;
                    const avatarUrl = item.avatarUrl;
                    const url = item.url;

                    items.push({
                        id, title, metadata, avatarUrl, url
                    });
                });
            }
            _this.mainWindowSender.send('findRecentProjectListCallback', items);
        } catch (e) {
            ShareUtil.printAxiosError(e);
            _this.mainWindowSender.send('findRecentProjectListCallback', []);
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
                    _this.findRecentJobList();
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

                        _this.findRecentJobList();
                    }
                });

        });
        //loginWindow.webContents.openDevTools();
    }
}

module.exports = JiraClient;
