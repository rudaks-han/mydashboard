import React, {useContext, useEffect, useState} from 'react';
import daouofficeIcon from '../../static/image/daouoffice.ico';
import {Card} from 'semantic-ui-react'
import UiShare from '../../UiShare';
import TimerContext from "../../TimerContext";
import ExtraButtons from "./ExtraButtons";
import RightMenu from "./RightMenu";
import AddLinkLayer from "../share/AddLinkLayer";
import TitleLayer from "../share/TitleLayer";
import ContentLayer from "./ContentLayer";

const { ipcRenderer } = window.require('electron');
const logger = window.require('electron-log').scope('daouoffice');

const Daouoffice = () => {
    const [list, setList] = useState(null);
    const [calendarList, setCalendarList] = useState(null);
    const [dayoffList, setDayoffList] = useState(null);
    const [myDayoffList, setMyDayoffList] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [username, setUsername] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [useAlarmClock, setUseAlarmClock] = useState({clockIn: true, beforeTime: 5, clockOut: true, afterTime: 0});
    const [clickedSetting, setClickSetting] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const tickTime = useContext(TimerContext);

    useEffect(() => {
        findList();
        findUserInfo();
        findCalendar();
        findNotificationCount();
        findStore();
        findDayoffList();
        findMyDayoffList();
    }, []);

    useEffect(() => {
        if (tickTime == null) return;
        if (!userInfo || !authenticated) return;
        const {year, month, day, hour, minute} = UiShare.getDateTimeFormat(tickTime);
        if (hour === 1 && minute === 0) {
            findUserInfo();
        }
        if (minute === 0) {
            findList();
            findCalendar();
            findNotificationCount();
        }

        console.log('tickTime : ' + tickTime);
        notifyClockCheck({year, month, day, hour, minute});
    }, [tickTime, authenticated]);

    const notifyClockCheck = currTime => {
        if (userInfo == null) return;
        //currTime = {year: 2021, month: 9, day: 30, hour: 16, minute: 0};
        //console.log('useAlarmClock.clockIn: ' + useAlarmClock.clockIn)
        if (useAlarmClock.clockIn) {
            showDialogClockIn(currTime);
        }

        //console.log('useAlarmClock.clockOut: ' + useAlarmClock.clockOut)
        if (useAlarmClock.clockOut) {
            showDialogClockOut(currTime);
        }
    }

    const showDialogClockIn = currTime => {
        const {year, month, day, hour, minute} = currTime;

        if (UiShare.isWeekend()) {
            console.log('weekend');
            return;
        }

        if (isHoliday()) {
            return;
        }

        if (isUserDayoff()) {
            console.log('user dayoff');
            return;
        }

        const beforeMinute = -useAlarmClock.beforeTime;
        let workStartTime = userInfo.workStartTime;
        const currDate = UiShare.getCurrDate();
        //const currDate = '2021-09-15';
        let clockInTimeString = `${currDate} ${workStartTime}`;
        //const clockInTimeString = '2021-09-08 15:20:00';
        let clockInTimeDate = new Date(clockInTimeString);
        let userHalfDayoffString = getUserHalfDayoff(); // 오전반차, 오후반차
        clockInTimeDate = getHalfDayoffClockInTime(clockInTimeDate, userHalfDayoffString);
        const clockInBeforeTime = UiShare.addMinutes(clockInTimeDate, beforeMinute);
        const clockInTimeHour = clockInBeforeTime.getHours();
        const clockInTimeMinute = clockInBeforeTime.getMinutes();

        //console.log('[showDialogClockIn]', 'hour', hour, 'minute', minute, 'clockInTimeHour', clockInTimeHour, 'clockInTimeMinute', clockInTimeMinute);
        if (hour === clockInTimeHour && minute === clockInTimeMinute) {
            setTimeout(() => {
                let message = '출근시간을 등록하시겠습니까?';
                if (userHalfDayoffString != null) {
                    message += '\n금일은 ' + userHalfDayoffString + ' 입니다';
                }
                const dialogOptions = {
                    title: '출근시간 등록',
                    message: message,
                    detail: `${username}님의 출근시간은 ${userInfo.workStartTime} 입니다.`,
                    buttons: ['Yes', 'No'],
                };

                UiShare.showMessageBox(dialogOptions).then(answer => {
                    if (answer === 'Yes') {
                        onClockIn();
                    }
                });
            }, 100);
        }
    }

    const showDialogClockOut = currTime => {
        const {year, month, day, hour, minute} = currTime;

        if (UiShare.isWeekend()) {
            return;
        }

        if (isHoliday()) {
            return;
        }

        if (isUserDayoff()) {
            console.log('user dayoff');
            return;
        }

        const afterMinute = useAlarmClock.afterTime;
        let workEndTime = userInfo.workEndTime;
        const currDate = UiShare.getCurrDate();
        //const currDate = '2021-09-15';
        const clockOutTimeString = `${currDate} ${workEndTime}`;
        //const clockOutTimeString = '2021-09-08 08:37:00';
        let clockOutTimeDate = new Date(clockOutTimeString);
        let userHalfDayoffString = getUserHalfDayoff(); // 오전반
        clockOutTimeDate = getHalfDayoffClockOutTime(clockOutTimeDate, userHalfDayoffString);
        //const clockOutTimeString = `${UiShare.getCurrDate()} ${workEndTime}`;

        const clockOutAfterTime = UiShare.addMinutes(clockOutTimeDate, afterMinute);
        const clockOutTimeHour = clockOutAfterTime.getHours();
        const clockOutTimeMinute = clockOutAfterTime.getMinutes();

        //console.log('[showDialogClockOut]', 'hour', hour, 'minute', minute, 'clockOutTimeHour', clockOutTimeHour, 'clockOutTimeMinute', clockOutTimeMinute);
        if (hour === clockOutTimeHour && minute === clockOutTimeMinute) {
            setTimeout(() => {
                let message = '퇴근시간을 등록하시겠습니까?';
                if (userHalfDayoffString != null) {
                    message += '\n금일은 ' + userHalfDayoffString + ' 입니다';
                }
                const dialogOptions = {
                    title: '퇴근시간 등록',
                    message: message,
                    detail: `${username}님의 퇴근시간은 ${userInfo.workEndTime} 입니다.`,
                    buttons: ['Yes', 'No'],
                };

                UiShare.showMessageBox(dialogOptions).then(answer => {
                    if (answer === 'Yes') {
                        onClockOut();
                    }
                });
            }, 100);
        }
    }

    const isHoliday = () => {
        const date = UiShare.getCurrDate();
        if (calendarList.holidayList[date] != null) {
            logger.debug(date + ' is holiday');
            return true;
        } else {
            return false;
        }
    }

    const isUserDayoff = () => {
        const date = UiShare.getCurrDate();
        const dayoffList = calendarList.dayOffList[date];
        dayoffList.map(item => {
            if (item.indexOf(username) > -1 || item.indexOf('보상휴가') > -1) {
                if ((item.indexOf('연차') > -1 || item.indexOf('보상') > -1)
                    && item.indexOf('오전') == -1 && item.indexOf('오후') == -1 && item.indexOf('반차') == -1) {
                    logger.debug(`[${username}] ${date} is day off`);
                    return true;
                }
            }
        });

        return false;
    }

    const getUserHalfDayoff = () => {
        const date = UiShare.getCurrDate();
        const dayoffList = calendarList.dayOffList[date];
        if (dayoffList) {
            for (let i = 0; i < dayoffList.length; i++) {
                let item = dayoffList[i];
                if (item.indexOf(username) > -1) {
                    if (item.indexOf('오전') > -1 && item.indexOf('반반차') > -1) {
                        logger.debug('오전반반차')
                        return '오전반반차';
                    } else if (item.indexOf('오후') > -1 && item.indexOf('반반차') > -1) {
                        logger.debug('오후반반차')
                        return '오후반반차';
                    } else if (item.indexOf('오전') > -1) {
                        logger.debug('오전반차')
                        return '오전반차';
                    } else if (item.indexOf('오후') > -1) {
                        logger.debug('오후반차')
                        return '오후반차';
                    } else if (item.indexOf('반차') > -1) {
                        logger.debug('오늘은 반차입니다. (오전/오후 알수 없음) ');
                        return '오전반차';
                    }
                }
            }
        }

        return null;
    }

    const getHalfDayoffClockInTime = (clockInTimeDate, halfDayoffType) => {
        let lunchHour = 0;
        if (halfDayoffType === '오전반반차') {
            if (clockInTimeDate.getHours() >= 10) {
                lunchHour = 1;
            }

            return UiShare.addHours(clockInTimeDate, 2 + lunchHour); //
        } else if (halfDayoffType === '오전반차') {
            if (clockInTimeDate.getHours() >= 8) {
                lunchHour = 1
            }
            return UiShare.addHours(clockInTimeDate, 4 + lunchHour);
        } else {
            return clockInTimeDate;
        }
    }

    const getHalfDayoffClockOutTime = (clockOutTimeDate, halfDayoffType) => {
        let lunchHour = 0;
        if (halfDayoffType === '오후반반차') {
            return UiShare.addHours(clockOutTimeDate, -2);
        } else if (halfDayoffType === '오후반차') {
            if (clockOutTimeDate.getHours() <= 16 || (clockOutTimeDate.getHours() <= 17 && clockOutTimeDate.getMinutes() === 0)) {
                lunchHour = 1;
            }
            return UiShare.addHours(clockOutTimeDate, -4 -lunchHour);
        } else {
            return clockOutTimeDate;
        }
    }

    const findList = () => {
        setList(null);
        ipcRenderer.send('daouoffice.findList');
        ipcRenderer.removeAllListeners('daouoffice.findListCallback');
        ipcRenderer.on('daouoffice.findListCallback', async (event, data) => {
            setList(data);
        });

        ipcRenderer.removeAllListeners('daouoffice.authenticated');
        ipcRenderer.on('daouoffice.authenticated', async (event, data) => {
            setAuthenticated(data);
        });
    }

    const findUserInfo = () => {
        ipcRenderer.send('daouoffice.findUserInfo');
        ipcRenderer.on('daouoffice.findUserInfoCallback', async (event, data) => {
            const clockedIn = data.clockInTime ? true: false;
            //const clockedIn = false; // 임시
            const clockedOut = data.clockOutTime ? true: false;

            setUserInfo({
                ...data,
                clockedIn,
                clockedOut
            });

            ipcRenderer.removeAllListeners('daouoffice.findUserInfoCallback');
        });
    }

    const findCalendar = () => {
        ipcRenderer.send('daouoffice.findCalendar');
        ipcRenderer.removeAllListeners('daouoffice.findCalendarCallback');
        ipcRenderer.on('daouoffice.findCalendarCallback', async (event, data) => {
            setCalendarList(data);
        });

    }

    const findNotificationCount = () => {
        ipcRenderer.send('daouoffice.findNotificationCount');
        ipcRenderer.on('daouoffice.findNotificationCountCallback', async (event, data) => {
            setNotificationCount(data.data);

            ipcRenderer.removeAllListeners('daouoffice.findNotificationCountCallback');
        });
    }

    const findStore = () => {
        ipcRenderer.send('daouoffice.findStore');
        ipcRenderer.on('daouoffice.findStoreCallback', async (event, data) => {
            setUsername(data.username);

            const clockIn = data.useAlarmClock.clockIn || false;
            const clockOut = data.useAlarmClock.clockOut || false;
            const beforeTime = data.useAlarmClock.beforeTime || 5;
            const afterTime = data.useAlarmClock.afterTime || 0;
            setUseAlarmClock({
                clockIn,
                clockOut,
                beforeTime,
                afterTime
            });
            ipcRenderer.removeAllListeners('daouoffice.findStoreCallback');
        });
    }

    const findDayoffList = () => {
        setDayoffList(null);
        ipcRenderer.send('daouoffice.findDayoffList');
        ipcRenderer.on('daouoffice.findDayoffListCallback', async (event, data) => {
            const dayoffList = data.filter(item => item.type == 'company').map(item => {
                const { id, startTime, endTime, summary, type } = item;
                const startTimeDate = startTime.substring(0, 10);
                const endTimeDate = endTime.substring(0, 10);

                return {
                    id, startTimeDate, endTimeDate, summary
                }
            });

            setDayoffList(dayoffList);
            ipcRenderer.removeAllListeners('daouoffice.findDayoffListCallback');
        });
    }

    const findMyDayoffList = () => {
        setMyDayoffList(null);
        ipcRenderer.send('daouoffice.findMyDayoffList');
        ipcRenderer.on('daouoffice.findMyDayoffListCallback', async (event, data) => {
            setMyDayoffList(data);
            ipcRenderer.removeAllListeners('daouoffice.findMyDayoffListCallback');
        });
    }

    const onClickRefresh = () => {
        findList();
        findDayoffList();
    }

    const onClickLogin = () => {
        ipcRenderer.send('daouoffice.openLoginPage');
    }

    const onClockIn = () => {
        ipcRenderer.send('daouoffice.clockIn');
        ipcRenderer.on('daouoffice.clockInCallback', async (event, data) => {
            const { code, message } = data;
            if (code === '200') {
                UiShare.showNotification('출근이 등록되었습니다.');
                findUserInfo();
                /*setUserInfo({
                    ...userInfo,
                    clockedIn: true,
                    clockInTime: UiShare.getCurrTime()
                });*/
            } else {
                UiShare.showNotification(message);
                if (code === '400') {
                    findUserInfo();
                    /*setUserInfo({
                        ...userInfo,
                        clockedIn: true
                    });*/
                }
            }

            ipcRenderer.removeAllListeners('daouoffice.clockInCallback');
        });
    }

    const onClockOut = () => {
        ipcRenderer.send('daouoffice.clockOut');
        ipcRenderer.on('daouoffice.clockOutCallback', async (event, data) => {
            const { code, message } = data;
            if (code === '200') {
                UiShare.showNotification('퇴근이 등록되었습니다.');
                findUserInfo();
                /*setUserInfo({
                    ...userInfo,
                    clockedOut: true,
                    clockOutTime: UiShare.getCurrTime()
                });*/
            } else {
                UiShare.showNotification(message);
                if (code === '400') {
                    findUserInfo();
                    /*setUserInfo({
                        ...userInfo,
                        clockedOut: true
                    });*/
                }
            }

            ipcRenderer.removeAllListeners('daouoffice.clockOutCallback');
        });
    }

    return (
        <Card fluid>
            <Card.Content>
                <Card.Header>
                    <TitleLayer title="Daouoffice" icon={daouofficeIcon} />
                    <RightMenu
                        authenticated={authenticated}
                        userInfo={userInfo}
                        clickedSetting={clickedSetting}
                        setClickSetting={setClickSetting}
                        findList={findList}
                        findDayoffList={findDayoffList}
                        notificationCount={notificationCount}
                        useAlarmClock={useAlarmClock}
                        setUseAlarmClock={setUseAlarmClock}
                        onClickRefresh={onClickRefresh}
                    />
                </Card.Header>
                <ContentLayer
                    title="Daouoffice"
                    authenticated={authenticated}
                    list={list}
                    dayoffList={dayoffList}
                    myDayoffList={myDayoffList}
                    onClickLogin={onClickLogin}
                    icon={daouofficeIcon}
                />
            </Card.Content>
            <Card.Content extra>
                <ExtraButtons
                    authenticated={authenticated}
                    userInfo={userInfo}
                    onClockIn={onClockIn}
                    onClockOut={onClockOut}
                />
                <AddLinkLayer href="https://spectra.daouoffice.com/app/hom" />
            </Card.Content>
        </Card>
    )
};

export default Daouoffice;
