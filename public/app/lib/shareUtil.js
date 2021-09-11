class ShareUtil {
    static getCurrDate() {
        return this.getCurrYear() + '-' + this.getCurrMonth() + '-' + this.getCurrDay();
    }

    static getCurrDateToMonth() {
        return this.getCurrYear() + '-' + this.getCurrMonth();
    }

    static getCurrTime() {
        const currDate = new Date();
        let hour = currDate.getHours();
        if (hour < 10)
            hour = '0' + hour;
        let minute = currDate.getMinutes();
        if (minute < 10)
            minute = '0' + minute;
        let second = currDate.getSeconds();
        if (second < 10)
            second = '0' + second;

        return hour + ':' + minute + ':' + second;
    }

    static getCurrYear() {
        const currDate = new Date();
        return currDate.getFullYear();
    }

    static getCurrMonth() {
        const currDate = new Date();
        let month = currDate.getMonth() + 1;
        if (month < 10)
            month = '0' + month;

        return month;
    }

    static getCurrDay() {
        const currDate = new Date();
        let day = currDate.getDate();
        if (day < 10)
            day = '0' + day;

        return day;
    }

    static getCurrHour() {
        const currDate = new Date();
        let hour = currDate.getHours();
        if (hour < 10)
            hour = '0' + hour;
        return hour;
    }

    static getCurrMinute() {
        const currDate = new Date();
        let minute = currDate.getMinutes();
        if (minute < 10)
            minute = '0' + minute;
        return minute;
    }

    static getCurrSecond() {
        const currDate = new Date();
        let second = currDate.getSeconds();
        if (second < 10)
            second = '0' + second;
        return second;
    }

    static printAxiosError(e) {
        const response = e.response;
        if (response) {
            const errorData = {
                status: response.status,
                statusText: response.statusText,
                headers: JSON.stringify(response.config.headers),
                cookie: response.config.headers.Cookie,
                url: response.config.url,
                method: response.config.method,
                configData: response.config.data,
                data: response.data && JSON.stringify(response.data)
            }
            ShareUtil.printlnMap('[axios error]', errorData);
        } else {
            console.error('response is undefined');
            //console.error(e);
        }
    }

    static printlnMap(title, map) {
        ShareUtil.println('-------------------------------------------------------------------------------');
        ShareUtil.println(title);
        ShareUtil.println('-------------------------------------------------------------------------------');
        for (let key in map) {
            ShareUtil.println(`[${key}] ${map[key]}`);
        }
        ShareUtil.println('-------------------------------------------------------------------------------');
    }

    static println(str) {
        console.log(str);
    }

    static printTable(str) {
        console.table(str);
    }

    static printlnWithDate(str) {
        console.log(`[${ShareUtil.getCurrDate()} ${ShareUtil.getCurrTime()}] ${str}`);
    }
}

module.exports = ShareUtil;
