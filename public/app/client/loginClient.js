const BaseClientComponent = require('./baseClientComponent');
const CookieConst = require('../const/cookieConst');
const ShareUtil = require('../lib/shareUtil');

class LoginClient extends BaseClientComponent {
    constructor(mainWindow) {
        super('login', mainWindow);
        this.bindIpcMainListener();
    }

    isAuthenticated() {
        const cookieData = this.getStore().get(CookieConst.daouoffice_for_app);
        const authenticated = typeof cookieData === 'object'
        return authenticated;
    }

    bindIpcMainListener() {
        this.ipcMainListener.on('findUserInfo', this.findUserInfo.bind(this));
    }

    findUserInfo() {
        const _this = this;

        this.request.get('https://spectra.daouoffice.com/api/user/today', this.getAxiosConfig(CookieConst.daouoffice_for_app),
            response => {
                const data = response.data.data;
                const { id, employeeNumber, name, position, deptMembers} = data.profile; // id: 7667, employeeNumber: 2014001
                const deptName = deptMembers[0].deptName;

                const userInfo = {id, employeeNumber, name, position, deptName};
                this.getStore().set('userInfo', userInfo);
                _this.mainWindowSender.send('findUserInfoCallback', userInfo);
                _this.mainWindowSender.send('authenticated', true);
            },
            error => {
                ShareUtil.printAxiosError(error);
                _this.mainWindowSender.send('authenticated', false);
            });
    }
}

module.exports = LoginClient;
