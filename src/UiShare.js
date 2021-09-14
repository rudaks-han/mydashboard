import {Placeholder} from "semantic-ui-react";
const os = window.require('os');
const { dialog } = window.require('electron').remote;

class UiShare {
    static displayListLoading = () => {
        return <Placeholder>
            <Placeholder.Header image>
                <Placeholder.Line/>
                <Placeholder.Line/>
            </Placeholder.Header>
            <Placeholder.Paragraph>
                <Placeholder.Line/>
                <Placeholder.Line/>
                <Placeholder.Line/>
                <Placeholder.Line/>
            </Placeholder.Paragraph>
        </Placeholder>
    };

    static showNotification(body, title = 'My Dashboard', onClickFn) {
        const notification = new Notification(
            title, {
                body
            });

        notification.onclick = e => {
            if (onClickFn) {
                onClickFn(e);
            }
        }
    }

    static async showMessageBox(options) {
        let choice = await dialog.showMessageBox({
            title: options.title,
            message: options.message,
            detail: options.detail,
            buttons: options.buttons
        });

        return options.buttons[choice.response];
    }

    static timeSince(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;

        if (interval > 1) {
            return Math.floor(interval) + " years";
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            return Math.floor(interval) + " months";
        }
        interval = seconds / 86400;
        if (interval > 1) {
            return Math.floor(interval) + " days";
        }
        interval = seconds / 3600;
        if (interval > 1) {
            return Math.floor(interval) + " hours";
        }
        interval = seconds / 60;
        if (interval > 1) {
            return Math.floor(interval) + " minutes";
        }
        return Math.floor(seconds) + " seconds";
    }

    static addMinutes(date, min) {
        date.setTime(date.getTime() + min * 60 * 1000);
        return date;
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

    static getCurrDate() {
        return UiShare.getCurrYear() + '-' + UiShare.getCurrMonth() + '-' + UiShare.getCurrDay();
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

    static getTimeFormat(time) {
        const arTime = time.split(':');
        return {
            hour: Number(arTime[0]),
            minute: Number(arTime[1]),
            second: Number(arTime[2])
        }
    }

    static getClientIp() {
        var ifaces = os.networkInterfaces();
        let ipAdresse = {};
        Object.keys(ifaces).forEach(function (ifname) {
            let alias = 0;
            ifaces[ifname].forEach(function (iface) {
                if ('IPv4' !== iface.family || iface.internal !== false) {
                    // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                    return;
                }

                if (alias >= 1) {
                    // this single interface has multiple ipv4 addresses
                    console.log(ifname + ':' + alias, iface.address);
                } else {
                    // this interface has only one ipv4 adress
                    console.log(ifname, iface.address);
                    ipAdresse = {ip: iface.address, mac: iface.mac};
                }
                ++alias;
            });
        });
        return ipAdresse;
    }
}

export default UiShare;
