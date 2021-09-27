const { BrowserWindow, session } = require('electron');
const axios = require('axios');
const BaseClientComponent = require('./baseClientComponent');
const ShareUtil = require('../lib/shareUtil');
const CookieConst = require('../const/cookieConst');

class JenkinsClient extends BaseClientComponent {
    constructor(mainWindow) {
        super('jenkins', mainWindow);
        this.availableModuleStoreId = 'jenkins.availableModules';
        this.useAlarmOnErrorStoreId = 'jenkins.useAlarmOnError';
        this.bindIpcMainListener();
    }

    bindIpcMainListener() {
        this.ipcMainListener.on('findList', this.findList.bind(this));
        this.ipcMainListener.on('findModuleList', this.findModuleList.bind(this));
        this.ipcMainListener.on('addAvailableModule', this.addAvailableModule.bind(this));
        this.ipcMainListener.on('removeAvailableModule', this.removeAvailableModule.bind(this));
        this.ipcMainListener.on('findUseAlarmOnError', this.findUseAlarmOnError.bind(this));
        this.ipcMainListener.on('useAlarmOnError', this.useAlarmOnError.bind(this));
        this.ipcMainListener.on('openLoginPage', this.openLoginPage.bind(this));
        this.ipcMainListener.on('logout', this.logout.bind(this));
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

        loginWindow.loadURL('http://211.63.24.41:8080/login');
        loginWindow.webContents.on('did-finish-load', event => {
            const url = event.sender.getURL();
            if (url === 'http://211.63.24.41:8080/') {
                this.getCookieAndStore('211.63.24.41', CookieConst.jenkins, () => {
                    loginWindow.close();
                    loginWindow = null;
                    _this.findList();
                    _this.findModuleList();
                });
            }
        })
        //loginWindow.webContents.openDevTools();
    }

    logout(event) {
        const _this = this;
        this.storeMap.set(CookieConst.jenkins, '');

        _this.mainWindowSender.send('authenticated', false);
        _this.mainWindowSender.send('findListCallback', []);
    }

    axiosConfig() {
        const cookieDataString = this.getCookieDataString(CookieConst.jenkins);
        return {
            headers: {
                Cookie: `${cookieDataString}`
            }
        };
    }

    getApiUrl(moduleName, branch) {
        return `http://211.63.24.41:8080/view/victory/job/${moduleName}/job/${branch}/lastBuild/api/json?moduleName=${moduleName}`;
    }

    getModuleUrl() {
        return `http://211.63.24.41:8080/view/victory/api/json`;
    }

    findUseAlarmOnError() {
        let data = this.getStore().get(this.useAlarmOnErrorStoreId);
        if (data == null) data = false;
        this.mainWindowSender.send('findUseAlarmOnErrorCallback', data);
    }

    findModuleList() {
        const _this = this;
        this.request.get(
            _this.getModuleUrl(),
            _this.axiosConfig(),
            response => {
                let moduleUrls = [];
                let filteredJobs = [];
                response.data.jobs.map(job => {
                    if (job._class === 'org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject') {
                        moduleUrls.push(axios.get(_this.getModuleDetailUrl(job.name), _this.axiosConfig()))
                        filteredJobs.push(job);
                    }
                });

                _this.request.all(
                    moduleUrls,
                    responses => {
                        responses.map(response => {
                            const fullName = response.data.fullName;

                            let branch = 'master';
                            const selectedJob = _this.filter(response.data.jobs, 'color', 'blue');
                            if (selectedJob != null) {
                                branch = selectedJob.name;
                            }

                            filteredJobs.map(filteredJob => {
                                if (filteredJob.name === fullName) {
                                    filteredJob['branch'] = branch;
                                }
                            });
                        });

                        _this.mainWindowSender.send('findModuleListCallback', {
                            data: filteredJobs,
                            availableModules: _this.getAvailableModules()
                        });
                    },
                    error => {
                        ShareUtil.printAxiosError(error);
                    });
            },
            error => {
                ShareUtil.printAxiosError(error);
            }
        )
    }

    filter(items, key, value) {
        let selectedItem = null;
        items.map(item => {
            if (item[key] == value) {
                if (selectedItem == null) {
                    selectedItem = item;
                }
            }
        });
        return selectedItem;
    }

    getModuleDetailUrl(moduleName) {
        return `http://211.63.24.41:8080/job/${moduleName}/api/json`;
    }

    addAvailableModule(event, data) {
        const name = data.name;
        const branch = data.value;
        const availableModules = this.getAvailableModules();
        let exists = false;
        availableModules.map(availableModule => {
            if (name == availableModule.name) {
                exists = true;
            }
        });

        if (!exists) {
            availableModules.push({name, branch});
            this.setAvailableModules(availableModules);
        }
    }

    removeAvailableModule(event, data) {
        const {name, branch} = data;
        const availableModules = this.getAvailableModules();

        const newAvailableModules = availableModules.filter(module => module.name !== name);
        this.setAvailableModules(newAvailableModules);
    }

    useAlarmOnError(event, data) {
        this.getStore().set(this.useAlarmOnErrorStoreId, data);
    }

    getAvailableModules() {
        return this.getStore().get(this.availableModuleStoreId);
    }

    setAvailableModules(data) {
        this.getStore().set(this.availableModuleStoreId, data);
    }

    findList() {
        let availableModules = this.getAvailableModules();
        if (!availableModules) {
            availableModules = [
                {
                    name: 'talk-api-mocha',
                    branch: 'master'
                }
            ];
            this.setAvailableModules(availableModules);
        }

        const _this = this;

        let urls = [];
        availableModules.map(module => {
            urls.push(axios.get(this.getApiUrl(module.name, module.branch), _this.axiosConfig()))
        });

        this.request.all(
            urls,
            responses => {
                let buildResults = [];
                let sessionExpired = true;
                responses.map(response => {
                    if (response.status === 200) {
                        const moduleName = this.extractModuleName(response.data.fullDisplayName);
                        const url = response.data.url;
                        const result = response.data.result;
                        const timestamp = response.data.timestamp;
                        const fullDisplayName = response.data.fullDisplayName;
                        let lastChangeSets = response.data.changeSets[0];
                        let lastCommit = {};
                        if (lastChangeSets) {
                            lastCommit['authorName'] = lastChangeSets.items[0].author.fullName;
                            lastCommit['comment'] = lastChangeSets.items[0].comment;
                            lastCommit['date'] = lastChangeSets.items[0].date;
                        }

                        sessionExpired = false;
                        buildResults.push({url, moduleName, result, timestamp, fullDisplayName, lastCommit, hasError: false})
                    } else {
                        const url = response.config.url;
                        const moduleName = _this.getParam(url, 'moduleName');
                        buildResults.push({url:'', moduleName, result:'', timestamp:0, fullDisplayName:'', lastCommit: {}, hasError: true})
                    }
                });

                _this.mainWindowSender.send('findListCallback', buildResults);
                _this.mainWindowSender.send('authenticated', sessionExpired ? false : true);
            },
            error => {
                ShareUtil.printAxiosError(error);
                _this.mainWindowSender.send('findListCallback', []);
                _this.mainWindowSender.send('authenticated', false);
            });
    }

    extractModuleName(fullDisplayName) {
        return fullDisplayName.substring(0, fullDisplayName.indexOf(' '));
    }

    getParam(url, name) {
        let params = url.substr(url.indexOf("?") + 1);
        let sval = "";

        params = params.split("&");

        for (let i = 0; i < params.length; i++) {
            let temp = params[i].split("=");
            if ([temp[0]] == name) { sval = temp[1]; }
        }

        return sval;
    }


}

module.exports = JenkinsClient;
