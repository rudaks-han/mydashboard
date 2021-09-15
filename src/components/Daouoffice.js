import React, {useContext, useEffect, useState} from 'react';
import daouofficeIcon from '../static/image/daouoffice.ico';
import {Button, Card, Dropdown, Header, Icon, Label, List, Menu, Popup, Segment, Tab, Table, Statistic} from 'semantic-ui-react'
import UiShare from '../UiShare';
import TimerContext from "../TimerContext";
import CompanyBoardList from "./daouoffice/CompanyBoardList";
import CompanyDayoffList from "./daouoffice/CompanyDayoffList";
import MyDayoffList from "./daouoffice/MyDayoffList";
import ExtraButtons from "./daouoffice/ExtraButtons";
import RightMenu from "./daouoffice/RightMenu";

const { ipcRenderer } = window.require('electron');

function Daouoffice() {
    const [list, setList] = useState(null);
    const [dayoffList, setDayoffList] = useState(null);
    const [myDayoffList, setMyDayoffList] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [username, setUsername] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);
    const [useAlarmClock, setUseAlarmClock] = useState({clockIn: true, clockOut: true});
    const [clickedSetting, setClickSetting] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const tickTime = useContext(TimerContext);

    useEffect(() => {
        findList();
        findUserInfo();
        findNotificationCount();
        findStore();
        findDayoffList();
        findMyDayoffList();
    }, []);

    useEffect(() => {
        if (tickTime == null) return;
        if (!userInfo || !authenticated) return;
        const {hour, minute} = UiShare.getTimeFormat(tickTime);
        if (minute === 0) {
            findList();
            findNotificationCount();
        }

        notifyClockCheck({hour, minute});
    }, [tickTime, userInfo, authenticated]);

    const notifyClockCheck = (currTime) => {
        if (userInfo == null) return;
        if (useAlarmClock.clockIn) {
            showDialogClockIn(currTime);
        }

        if (useAlarmClock.clockOut) {
            showDialogClockOut(currTime);
        }
    }

    const showDialogClockIn = (currTime) => {
        const {hour, minute} = currTime;

        const beforeMinute = -5;
        const clockInTimeString = `${UiShare.getCurrDate()} ${userInfo.workStartTime}`;
        //const clockInTimeString = '2021-09-08 15:20:00';
        const clockInTimeDate = new Date(clockInTimeString);
        const clockInBeforeTime = UiShare.addMinutes(clockInTimeDate, beforeMinute);
        const clockInTimeHour = clockInBeforeTime.getHours();
        const clockInTimeMinute = clockInBeforeTime.getMinutes();

        if (hour === clockInTimeHour && minute === clockInTimeMinute) {
            setTimeout(() => {
                const dialogOptions = {
                    title: '출근시간 등록',
                    message: '출근시간을 등록하시겠습니까?',
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

    const showDialogClockOut = (data) => {
        const {hour, minute} = data;

        const afterMinute = 0;
        const clockOutTimeString = `${UiShare.getCurrDate()} ${userInfo.workEndTime}`;
        //const clockOutTimeString = '2021-09-08 08:37:00';
        const clockOutTimeDate = new Date(clockOutTimeString);
        const clockOutAfterTime = UiShare.addMinutes(clockOutTimeDate, afterMinute);
        const clockOutTimeHour = clockOutAfterTime.getHours();
        const clockOutTimeMinute = clockOutAfterTime.getMinutes();

        if (hour === clockOutTimeHour && minute === clockOutTimeMinute) {
            setTimeout(() => {
                const dialogOptions = {
                    title: '퇴근시간 등록',
                    message: '퇴근시간을 등록하시겠습니까?',
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


    const findList = () => {
        setList(null);
        ipcRenderer.send('daouoffice.findList');
        ipcRenderer.removeAllListeners('daouoffice.findListCallback');
        ipcRenderer.on('daouoffice.findListCallback', async (e, data) => {
            setList(data);
        });

        ipcRenderer.removeAllListeners('daouoffice.authenticated');
        ipcRenderer.on('daouoffice.authenticated', async (e, data) => {
            setAuthenticated(data);
        });
    }

    const findUserInfo = () => {
        ipcRenderer.send('daouoffice.findUserInfo');
        ipcRenderer.on('daouoffice.findUserInfoCallback', async (e, data) => {
            const clockedIn = data.clockInTime ? true: false;
            const clockedOut = data.clockOutTime ? true: false;

            setUserInfo({
                ...data,
                clockedIn,
                clockedOut
            });

            ipcRenderer.removeAllListeners('daouoffice.findUserInfoCallback');
        });
    }

    const findNotificationCount = () => {
        ipcRenderer.send('daouoffice.findNotificationCount');
        ipcRenderer.on('daouoffice.findNotificationCountCallback', async (e, data) => {
            setNotificationCount(data.data);

            ipcRenderer.removeAllListeners('daouoffice.findNotificationCountCallback');
        });
    }

    const findStore = () => {
        ipcRenderer.send('daouoffice.findStore');
        ipcRenderer.on('daouoffice.findStoreCallback', async (e, data) => {
            setUsername(data.username);

            const clockIn = data.useAlarmClock.clockIn || false;
            const clockOut = data.useAlarmClock.clockOut || false;
            setUseAlarmClock({
                clockIn,
                clockOut
            });
            ipcRenderer.removeAllListeners('daouoffice.findStoreCallback');
        });
    }

    const findDayoffList = () => {
        setDayoffList(null);
        ipcRenderer.send('daouoffice.findDayoffList');
        ipcRenderer.on('daouoffice.findDayoffListCallback', async (e, data) => {
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
        ipcRenderer.on('daouoffice.findMyDayoffListCallback', async (e, data) => {
            setMyDayoffList(data);
            ipcRenderer.removeAllListeners('daouoffice.findMyDayoffListCallback');
        });
    }

    const displayListLayer = () => {
        if (authenticated) {
            return (
                <div className="list-layer">
                    <Tab panes={[
                        {
                            menuItem: '전사 게시판', render: () =>
                                <Tab.Pane>
                                    <CompanyBoardList list={list}/>
                                </Tab.Pane>
                        },
                        {
                            menuItem: '회사 연차현황', render: () =>
                                <Tab.Pane>
                                    <CompanyDayoffList dayoffList={dayoffList} />
                                </Tab.Pane>
                        },
                        {
                            menuItem: '내 연차', render: () =>
                                <Tab.Pane>
                                    <MyDayoffList myDayoffList={myDayoffList} />
                                </Tab.Pane>
                        }
                    ]} />
                </div>
            )
        } else {
            return <Segment placeholder>
                <Header icon>
                    <img src={daouofficeIcon} alt="" className="component-icon"/>
                    Daouoffice에 로그인
                </Header>
                <Button primary onClick={onClickLogin}>Login</Button>
            </Segment>;
        }
    }

    const onClickLogin = () => {
        ipcRenderer.send('daouoffice.openLoginPage');
    }

    const onClockIn = () => {
        ipcRenderer.send('daouoffice.clockIn');
        ipcRenderer.on('daouoffice.clockInCallback', async (e, data) => {
            const { code, message } = data;
            if (code === '200') {
                UiShare.showNotification('출근이 등록되었습니다.');
                setUserInfo({
                    ...userInfo,
                    clockedIn: true,
                    clockInTime: UiShare.getCurrTime()
                });
            } else {
                if (code === '400') {
                    setUserInfo({
                        ...userInfo,
                        clockedIn: true
                    });
                }
                UiShare.showNotification(message);
            }

            ipcRenderer.removeAllListeners('daouoffice.clockInCallback');
        });
    }

    const onClockOut = () => {
        ipcRenderer.send('daouoffice.clockOut');
        ipcRenderer.on('daouoffice.clockOutCallback', async (e, data) => {
            const { code, message } = data;
            if (code === '200') {
                UiShare.showNotification('퇴근이 등록되었습니다.');
                setUserInfo({
                    ...userInfo,
                    clockedOut: true,
                    clockOutTime: UiShare.getCurrTime()
                });
            } else {
                if (code === '400') {
                    setUserInfo({
                        ...userInfo,
                        clockedOut: true
                    });
                }
                UiShare.showNotification(message);
            }

            ipcRenderer.removeAllListeners('daouoffice.clockOutCallback');
        });
    }

    return (
        <Card fluid>
            <Card.Content>
                <Card.Header>
                    <div className="ui header">
                        <img src={daouofficeIcon} alt="" className="header-icon"/>
                        Daouoffice
                    </div>

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
                    />
                </Card.Header>

                {displayListLayer()}

            </Card.Content>

            <Card.Content extra>
                <ExtraButtons
                    authenticated={authenticated}
                    userInfo={userInfo}
                    onClockIn={onClockIn}
                    onClockOut={onClockOut}
                />

                <div>
                    <Button fluid color="blue" as='a' href={'https://spectra.daouoffice.com/app/home'} rel="noreferrer" target='_blank'>
                        바로 가기
                    </Button>
                </div>
            </Card.Content>
        </Card>
    )
};

export default Daouoffice;
