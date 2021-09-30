const { BrowserWindow, session } = require('electron');
const axios = require('axios');
const ShareUtil = require('../lib/shareUtil');
const BaseClientComponent = require('./baseClientComponent');
const CookieConst = require('../const/cookieConst');

class DaouofficeClient extends BaseClientComponent {
    constructor(mainWindow) {
        super('daouoffice', mainWindow);
        //this.daouofficeUserId = 'daouoffice_userId'; // 7667
        this.storeId = CookieConst.daouoffice;
        this.clockInTimeStoreId = 'daouoffice.clockInTime';
        this.clockOutTimeStoreId = 'daouoffice.clockOutTime';
        this.useAlarmClock = 'daouoffice.useAlarmClock';
        this.bindIpcMainListener();
    }

    bindIpcMainListener() {
        this.ipcMainListener.on('findList', this.findList.bind(this));
        this.ipcMainListener.on('findNotificationCount', this.findNotificationCount.bind(this));
        this.ipcMainListener.on('findCalendar', this.findCalendar.bind(this));
        this.ipcMainListener.on('findDayoffList', this.findDayoffList.bind(this));
        this.ipcMainListener.on('findMyDayoffList', this.findMyDayoffList.bind(this));
        this.ipcMainListener.on('setUseAlarmClock', this.setUseAlarmClock.bind(this));
        this.ipcMainListener.on('openLoginPage', this.openLoginPage.bind(this));
        this.ipcMainListener.on('logout', this.logout.bind(this));
        this.ipcMainListener.on('clockIn', this.clockIn.bind(this));
        this.ipcMainListener.on('clockOut', this.clockOut.bind(this));
        this.ipcMainListener.on('findStore', this.findStore.bind(this));

        this.ipcMainListener.on('findUserInfo', this.findUserInfo.bind(this));
    }

    getUserId() {
        //return this.storeMap.get(this.daouofficeUserId);
        return this.storeMap.get("userInfo.id");
    }

    openLoginPage() {
        const _this = this;
        let loginWindow = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true,
                contextIsolation : false
            },
            width: 1200,
            height: 800
        })

        loginWindow.loadURL('https://spectra.daouoffice.com/login');
        loginWindow.webContents.on('did-finish-load', event => {
            const url = event.sender.getURL();
            if (url.endsWith('login')) {
                this.resetStore(CookieConst.daouoffice);
            } else {
                _this.getCookieAndStore('spectra.daouoffice.com', _this.storeId, (str) => {
                    loginWindow.close();
                    loginWindow = null;
                    _this.findList();
                    //_this.findSession();
                    _this.findUserInfo();
                });
            }
        });
    }

    logout(e) {
        const _this = this;
        this.storeMap.set(_this.storeId, '');

        _this.mainWindowSender.send('authenticated', false);
        _this.mainWindowSender.send('findListCallback', []);
    }

    async findSession() {
        const _this = this;
        const response = await axios.get(`https://spectra.daouoffice.com/api/user/session`, _this.axiosConfig());
        const userId = response.data.data.repId;
        console.log('userId : ' + userId)
        _this.storeMap.set(_this.daouofficeUserId, userId);
    }

    async findUserInfo() {
        const _this = this;
        let data = {}

        const response = await axios.all(
            [
                axios.get('https://spectra.daouoffice.com/api/ehr/timeline/info', _this.axiosConfig()),
                axios.get('https://spectra.daouoffice.com/api/ehr/timeline/summary', _this.axiosConfig())
                ]
        );

        const infoResponse = response[0];
        const infoData = infoResponse.data.data;
        data = {
            ...data,
            clockInTime: infoData.workInTime,
            clockOutTime: infoData.workOutTime
        };

        const summaryResponse = response[1];

        //const workTimeRange = summaryResponse.data.group.fixedOption.workTimeRange;
        const workTimeRange = summaryResponse.data.week.dailyList[0].timelineGroup.fixedOption.workTimeRange;
        const workStartTime = workTimeRange.workStartTime;
        const workEndTime = workTimeRange.workEndTime;

        _this.getStore().set(this.clockInTimeStoreId, workStartTime);
        _this.getStore().set(this.clockOutTimeStoreId, workEndTime);

        data = {
            ...data,
            workStartTime,
            workEndTime
        };

        try {
            _this.mainWindowSender.send('findUserInfoCallback', data);
        } catch (error) {
            ShareUtil.printAxiosError(error);
        }
    }

    async findList() {
        const _this = this;
        const count = 10;

        try {
            const response = await axios.get(`https://spectra.daouoffice.com/api/board/2302/posts?offset=${count}&page=0`, _this.axiosConfig());
            _this.mainWindowSender.send('authenticated', true);
            _this.mainWindowSender.send('findListCallback', response.data.data);
        } catch (error) {
            _this.mainWindowSender.send('authenticated', false);
            _this.mainWindowSender.send('findListCallback', []);
        }
    }

    async findNotificationCount() {
        const _this = this;

        try {
            const response = await axios.get(`https://spectra.daouoffice.com/api/home/noti/new`, _this.axiosConfig());
            _this.mainWindowSender.send('findNotificationCountCallback', response.data);
        } catch (error) {
            ShareUtil.printAxiosError(error);
        }
    }

    async findCalendar() {
        const _this = this;

        try {
            const response = await axios.get(`https://spectra.daouoffice.com/api/calendar/user/me/event/daily?year=${this.getCurrYear()}&month=${this.getCurrMonth()}`, _this.axiosConfig());
            let holidayList = {};
            let dayOffList = {};
            let list = response.data.data.list;

            list.map(item => {
                let datetime = item.datetime;
                let eventList = item.eventList;

                let date = datetime.substring(0, 10);

                if (eventList.length > 0) {
                    eventList.map(event => {
                        let type = event.type; // holiday: 휴일, company: 연차/공가)
                        let summary = event.summary; // 연차 : 서형태, 반차: 이승엽(오후), 공가 : 유민(오후)

                        if (type === 'holiday' || type === 'anniversary') { // anniversary : 근로자의 날
                            holidayList[date] = type;
                        } else if (type === 'company') {
                            if (!dayOffList[date])
                                dayOffList[date] = [];
                            if (_this.hasDayoffString(summary)) {
                                dayOffList[date].push(summary); // summary => 연차 : 한경만
                            }
                        } else if (type === 'normal') {
                            if (summary === '연차') {
                                dayOffList[date].push(summary + ':' + event.creator.name);
                            }
                        }
                    });
                }
            });

            _this.mainWindowSender.send('findCalendarCallback', {
                holidayList,
                dayOffList
            });
        } catch (error) {
            ShareUtil.printAxiosError(error);
        }
    }

    hasDayoffString(summary) {
        const dayoffString = ['연차', '반차', '장기근속', '보상'];

        for (let i=0; i<dayoffString.length; i++) {
            if (summary.indexOf(dayoffString[i]) > -1) {
                return true;
            }
        }

        return false;
    }

    async findDayoffList() {
        const _this = this;

        const currDate = ShareUtil.getCurrDate();
        const toDate = ShareUtil.addDays(currDate, 7);

        try {
            const response = await axios.get(`https://spectra.daouoffice.com/api/calendar/event?timeMin=${currDate}T00%3A00%3A00.000%2B09%3A00&timeMax=${toDate}T23%3A59%3A59.999%2B09%3A00&includingAttendees=true&calendarIds%5B%5D=8452&calendarIds%5B%5D=8987&calendarIds%5B%5D=11324&calendarIds%5B%5D=11326`, _this.axiosConfig());
            _this.mainWindowSender.send('findDayoffListCallback', response.data.data);
        } catch (error) {
            ShareUtil.printAxiosError(error);
        }
    }

    async findMyDayoffList() {
        const _this = this;

        const currDate = ShareUtil.getCurrDate();

        try {
            const response = await axios.get(`https://spectra.daouoffice.com/api/ehr/vacation/stat?baseDate=${currDate}`, _this.axiosConfig());
            _this.mainWindowSender.send('findMyDayoffListCallback', response.data.data);
        } catch (error) {
            ShareUtil.printAxiosError(error);
        }
    }

    getCurrYear() {
        const currDate = new Date();
        return currDate.getFullYear();
    }

    getCurrMonth() {
        const currDate = new Date();
        let month = currDate.getMonth() + 1;
        if (month < 10)
            month = '0' + month;

        return month;
    }

    axiosConfig() {
        const _this = this;
        const cookieDataString = this.getCookieDataString(_this.storeId);
        return {
            headers: {
                TimeZoneOffset: 540,
                Cookie: `${cookieDataString};`
            }
        };
    }

    setUseAlarmClock(error, data) {
        this.getStore().set(this.useAlarmClock, data);
    }

    async clockIn() {
        const _this = this;
        const data = {"checkTime":`${ShareUtil.getCurrDate()}T${ShareUtil.getCurrTime()}.000Z`,"timelineStatus":{},"isNightWork":false,"workingDay":`${ShareUtil.getCurrDate()}`};

        try {
            const response = await axios.post(`https://spectra.daouoffice.com/api/ehr/timeline/status/clockIn?userId=${this.getUserId()}&baseDate=${ShareUtil.getCurrDate()}`, data, _this.axiosConfig());
            _this.mainWindowSender.send('clockInCallback', response.data);
        } catch (error) {
            ShareUtil.printAxiosError(error);
            _this.mainWindowSender.send('clockInCallback', error.response.data);
        }
    }

    async clockOut() {
        const _this = this;
        const data = {"checkTime":`${ShareUtil.getCurrDate()}T${ShareUtil.getCurrTime()}.000Z`,"timelineStatus":{},"isNightWork":false,"workingDay":`${ShareUtil.getCurrDate()}`};

        try {
            const response = await axios.post(`https://spectra.daouoffice.com/api/ehr/timeline/status/clockOut?userId=${this.getUserId()}&baseDate=${ShareUtil.getCurrDate()}`, data, _this.axiosConfig());
            _this.mainWindowSender.send('clockOutCallback', response.data);
        } catch (error) {
            ShareUtil.printAxiosError(error);
            _this.mainWindowSender.send('clockOutCallback', error.response.data);
        }
    }

    async findStore() {
        const _this = this;
        const username = this.storeMap.get('userInfo.name');
        const useAlarmClock = this.storeMap.get('daouoffice.useAlarmClock');

        const data = {
            username,
            useAlarmClock: {
                clockIn: useAlarmClock ? useAlarmClock.clockIn : false,
                clockOut: useAlarmClock ? useAlarmClock.clockOut : false,
                beforeTime: useAlarmClock ? useAlarmClock.beforeTime : 5,
                afterTime: useAlarmClock ? useAlarmClock.afterTime : 0,
            }
        };
        _this.mainWindowSender.send('findStoreCallback', data);
    }
}

module.exports = DaouofficeClient;
