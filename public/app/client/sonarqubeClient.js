const axios = require('axios');
const ShareUtil = require('../lib/shareUtil');
const BaseClientComponent = require('./baseClientComponent');

class SonarqubeClient extends BaseClientComponent {
    constructor(mainWindow) {
        super('sonarqube', mainWindow);
        this.availableModuleStoreId = 'sonarqube.availableModules';
        this.bindIpcMainListener();
    }

    bindIpcMainListener() {
        this.ipcMainListener.on('findList', this.findList.bind(this));
        this.ipcMainListener.on('findModuleList', this.findModuleList.bind(this));
        this.ipcMainListener.on('addAvailableModule', this.addAvailableModule.bind(this));
        this.ipcMainListener.on('removeAvailableModule', this.removeAvailableModule.bind(this));
    }

    getApiUrl(key) {
        return `http://211.63.24.41:9000/api/measures/component?component=${key}&metricKeys=new_bugs,new_vulnerabilities,new_security_hotspots,new_code_smells,projects`;
    }

    async findModuleList() {
        const _this = this;

        try {
            const response = await axios.get(`http://211.63.24.41:9000/api/components/search?qualifiers=TRK`);
            _this.mainWindowSender.send('findModuleListCallback', {
                data: response.data,
                availableModules: _this.getAvailableModules()
            });
        } catch (e) {
            ShareUtil.printAxiosError(e);
        }
    }

    addAvailableModule(e, data) {
        const {name, key} = data;
        const availableModules = this.getAvailableModules();

        let exists = false;
        availableModules.map(availableModule => {
            if (name == availableModule.name) {
                exists = true;
            }
        });

        if (!exists) {
            availableModules.push({name, key});
            this.setAvailableModules(availableModules);
        }
    }

    removeAvailableModule(e, data) {
        const {name, key} = data;
        const availableModules = this.getAvailableModules();

        const newAvailableModules = availableModules.filter(module => module.name !== name);
        this.setAvailableModules(newAvailableModules);
    }

    getAvailableModules() {
        const modules = this.getStore().get(this.availableModuleStoreId);
        return  modules == null ? [] : modules;
    }

    setAvailableModules(data) {
        this.getStore().set(this.availableModuleStoreId, data);
    }

    findList() {
        let availableModules = this.getAvailableModules();
        if (!availableModules || availableModules.length === 0) {
            availableModules = [{
                name: 'talk-api-mocha',
                key: 'talk-api-mocha'
            }];
            this.setAvailableModules(availableModules);
        }

        const _this = this;

        let urls = [];
        availableModules.map(module => {
            urls.push(axios.get(this.getApiUrl(module.key)))
        });

        this.request.all(
            urls,
            responses => {
                let buildResults = [];
                responses.map(response => {
                    if (response.status === 200) {
                        const moduleName = response.data.component.name;
                        const measures = response.data.component.measures;
                        buildResults.push({ moduleName, measures, hasError: false })
                    } else {
                        const url = response.config.url;
                        const moduleName = _this.getParam(url, 'component');
                        buildResults.push({moduleName, measures: [], hasError: true})
                    }

                });

                _this.mainWindowSender.send('authenticated', true);
                _this.mainWindowSender.send('findListCallback', buildResults);
            },
            error => {
                ShareUtil.printAxiosError(error);
            });
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

module.exports = SonarqubeClient;
