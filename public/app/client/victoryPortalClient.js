const axios = require('axios');
const ShareUtil = require('../lib/shareUtil');
const BaseClientComponent = require('./baseClientComponent');

class VictoryPortalClient extends BaseClientComponent {
    constructor(mainWindow) {
        super('victoryPortal', mainWindow);
        this.token = 'a21oYW46THRzRCBmNm5GIHFIUGcgMFdXZCB2dWxjIHA5aVE=';
        this.bindIpcMainListener();
    }

    bindIpcMainListener() {
        //this.clearSsoCookie();
        this.ipcMainListener.on('findList', this.findList.bind(this));
        //this.ipcMainListener.on('login', this.login.bind(this));
    }

    getAxiosConfig() {
        return {
            headers: {
                Authorization: `Basic ${this.token}`
            }
        };
    }

    async findList() {
        const _this = this;

        try {
            const response = await axios.get(`https://victory-portal.spectra.co.kr/wp-json/wp/v2/posts?per_page=10`, _this.getAxiosConfig());
            _this.mainWindowSender.send('authenticated', true);
            _this.mainWindowSender.send('findListCallback', response.data);
        } catch (error) {
            ShareUtil.printAxiosError(error);
        }
    }
}

module.exports = VictoryPortalClient;
