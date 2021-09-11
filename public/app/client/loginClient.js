const BaseClientComponent = require('./baseClientComponent');
const axios = require('axios');
const CookieConst = require('../const/cookieConst');
const ShareUtil = require('../lib/shareUtil');

class LoginClient extends BaseClientComponent {
    constructor(mainWindow) {
        super('login', mainWindow);
    }

    isAuthenticated() {
        const cookieData = this.getStore().get(CookieConst.daouoffice_for_app);
        const authenticated = typeof cookieData === 'object'
        return authenticated;
    }

    async getUserInfo() {
        const _this = this;

        try {
            const response = await axios.get(`https://spectra.daouoffice.com/api/home/noti/new`, this.getAxiosConfig(CookieConst.daouoffice_for_app));
            const data = response.data.data;
            const { id, employeeNumber, name, position, deptMembers} = data.profile; // id: 7667, employeeNumber: 2014001
            const deptName = deptMembers[0].deptName;

            const userInfo = {id, employeeNumber, name, position, deptName};
            console.log(userInfo)

            this.getStore().set('userInfo', userInfo);
            _this.mainWindowSender.send('getUserInfoCallback', userInfo);
        } catch (e) {
            ShareUtil.printAxiosError(e);
        }
    }
}

module.exports = LoginClient;
