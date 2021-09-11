const axios = require('axios');
const BaseClientComponent = require('./baseClientComponent');
const ShareUtil = require('../lib/shareUtil');

class JenkinsClient extends BaseClientComponent {
    constructor(mainWindow) {
        super('jenkins', mainWindow);
        this.userId = 'kmhan';
        this.token = '1124f95f1ddfe9a55649bef93257a1c896';
        this.availableModuleStoreId = 'jenkins.availableModules';
        this.bindIpcMainListener();
    }

    bindIpcMainListener() {
        this.ipcMainListener.on('findList', this.findList.bind(this));
        this.ipcMainListener.on('findModuleList', this.findModuleList.bind(this));
        this.ipcMainListener.on('addAvailableModule', this.addAvailableModule.bind(this));
        this.ipcMainListener.on('removeAvailableModule', this.removeAvailableModule.bind(this));
    }

    getApiUrl(moduleName, branch) {
        return `http://${this.userId}:${this.token}@211.63.24.41:8080/view/victory/job/${moduleName}/job/${branch}/lastBuild/api/json?moduleName=${moduleName}`;
    }

    getModuleUrl() {
        return `http://${this.userId}:${this.token}@211.63.24.41:8080/view/victory/api/json`;
    }

    findModuleList() {
        const _this = this;
        this.request.get(
            _this.getModuleUrl(),
            {},
            response => {
                let moduleUrls = [];
                let filteredJobs = [];
                response.data.jobs.map(job => {
                    if (job._class === 'org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject') {
                        moduleUrls.push(axios.get(_this.getModuleDetailUrl(job.name)))
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
        return `http://${this.userId}:${this.token}@211.63.24.41:8080/job/${moduleName}/api/json`;
    }

    addAvailableModule(e, data) {
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

    removeAvailableModule(e, data) {
        const {name, branch} = data;
        const availableModules = this.getAvailableModules();

        const newAvailableModules = availableModules.filter(module => module.name !== name);
        this.setAvailableModules(newAvailableModules);
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
            urls.push(axios.get(this.getApiUrl(module.name, module.branch)))
        });

        this.request.all(
            urls,
            responses => {
                let buildResults = [];
                responses.map(response => {
                    if (response.status === 200) {
                        const moduleName = this.extractModuleName(response.data.fullDisplayName);
                        const url = response.data.url;
                        const result = response.data.result;
                        const timestamp = response.data.timestamp;
                        const fullDisplayName = response.data.fullDisplayName;

                        buildResults.push({url, moduleName, result, timestamp, fullDisplayName, hasError: false})
                    } else {
                        const url = response.config.url;
                        const moduleName = _this.getParam(url, 'moduleName');
                        buildResults.push({url:'', moduleName, result:'', timestamp:0, fullDisplayName:'', hasError: true})
                    }
                });

                _this.mainWindowSender.send('findListCallback', buildResults);
            },
            error => {
                ShareUtil.printAxiosError(error);
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
