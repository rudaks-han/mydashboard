import React, {useContext, useEffect, useState} from 'react';
import daouofficeIcon from '../static/image/daouoffice.ico';
import {Button, Card, Dropdown, Header, Icon, Label, List, Menu, Popup, Segment, Tab, Table, Statistic} from 'semantic-ui-react'
import UiShare from '../UiShare';
import {clearIntervalAsync, setIntervalAsync} from 'set-interval-async/dynamic'
import TimerContext from "../TimerContext";

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

    useEffect(() => {
        if (!userInfo) return;

        let findListTimer;
        let notifyClockTimer;

        if (authenticated) {
            findListTimer = setIntervalAsync(
                async () => {
                    findList();
                    findNotificationCount();
                },
                1000 * 60 * 60
            );

            notifyClockTimer = setIntervalAsync(
                async () => {
                    const currTime = UiShare.getCurrTime().split(':');
                    const hour = Number(currTime[0]);
                    const minute = Number(currTime[1]);
                    notifyClockCheck({ hour, minute });
                },
                1000 * 60
            );
        } else {
            (async () => {
                if (findListTimer) {
                    await clearIntervalAsync(findListTimer);
                }
                if (notifyClockTimer) {
                    await clearIntervalAsync(notifyClockTimer);
                }
            })();
        }

        return () => {
            (async () => {
                if (findListTimer) {
                    await clearIntervalAsync(findListTimer);
                }
                if (notifyClockTimer) {
                    await clearIntervalAsync(notifyClockTimer);
                }
            })();
        };
    }, [userInfo, authenticated])

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

    const rightBtnTrigger = (
        <span>
            <Icon name='user' />
        </span>
    )

    const displayListLayer = () => {
        if (authenticated) {
            return (
                <div className="list-layer">
                    <Tab panes={[
                        {
                            menuItem: '전사 게시판', render: () =>
                                <Tab.Pane>
                                    <List divided relaxed style={{height: '200px'}}>
                                        {displayListItem()}
                                    </List>
                                </Tab.Pane>
                        },
                        {
                            menuItem: '회사 연차현황', render: () =>
                                <Tab.Pane>
                                    <Table celled style={{display: 'block', height: '200px', overflowY: 'auto'}}>
                                        <Table.Body>
                                            {displayDayoffList()}
                                        </Table.Body>
                                    </Table>
                                </Tab.Pane>
                        },
                        {
                            menuItem: '내 연차', render: () =>
                                <div style={{margin: '20px'}}>
                                    {displayMyDayoffList()}
                                </div>
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

    const displayListItem = () => {
        if (list == null) {
            return UiShare.displayListLoading();
        } else {
            return list.map(item => {
                const { id, title, readPost, createdAt, writer } = item;
                let createdAtFormat = createdAt.substring(0, 16);
                createdAtFormat = createdAtFormat.replace(/T/, ' ');

                let readFlagStyle = '';
                if (readPost) {
                    readFlagStyle = 'normal';
                }

                return <List.Item key={id}>
                    <List.Content>
                        <List.Header>
                            <a href={`https://spectra.daouoffice.com/app/board/2302/post/${id}`} rel="noreferrer" target="_blank" style={{fontWeight:readFlagStyle}}>{title}</a>
                        </List.Header>
                        <List.Description>{createdAtFormat} {writer.name} {writer.positionName}</List.Description>
                    </List.Content>
                </List.Item>;
            });
        }
    }

    const displayDayoffList = () => {
        if (dayoffList == null) {
            return (
                <Table.Row>
                    <Table.Cell>
                        {UiShare.displayListLoading()}
                    </Table.Cell>
                </Table.Row>
            );
        }

        return dayoffList.map(item => {
            const { id, startTimeDate, endTimeDate, summary } = item;

            let timeString = '';
            if (startTimeDate !== endTimeDate) {
                timeString = startTimeDate + '\n~' + endTimeDate;
            } else {
                timeString = startTimeDate;
            }
            return (
                <Table.Row key={id}>
                    <Table.Cell className='new-line' style={{minWidth: '105px'}}>{timeString}</Table.Cell>
                    <Table.Cell>{summary}</Table.Cell>
                </Table.Row>
            )
        });
    }

    const displayMyDayoffList = () => {
        console.error(myDayoffList)
        if (myDayoffList == null) {
            return (
                <Table.Row>
                    <Table.Cell>
                        {UiShare.displayListLoading()}
                    </Table.Cell>
                </Table.Row>
            );
        }

        const { startDate, endDate, sumPoint, usedPoint, restPoint } = myDayoffList;

        return (
            <div>
                <Label>
                    연차 사용기간
                    <Label.Detail>
                        {startDate} ~ {endDate}
                    </Label.Detail>
                </Label>
                <Statistic.Group size="mini">
                    <Statistic>
                        <Statistic.Value>{sumPoint}</Statistic.Value>
                        <Statistic.Label>총 연차</Statistic.Label>
                    </Statistic>
                    <Statistic>
                        <Statistic.Value>{usedPoint}</Statistic.Value>
                        <Statistic.Label>사용 연차</Statistic.Label>
                    </Statistic>
                    <Statistic color='red'>
                        <Statistic.Value>{restPoint}</Statistic.Value>
                        <Statistic.Label>잔여 연차</Statistic.Label>
                    </Statistic>
                </Statistic.Group>
            </div>
        );
    }

    const displayRightMenu = () => {
        if (authenticated && userInfo) {
            return <div className="btn-right-layer">
                <Icon name='expand arrows alternate' className='component-move'/>
                <Icon name='refresh' onClick={onClickRefresh}/>
                <Menu.Item as='a' href={'https://spectra.daouoffice.com/app/noti/unread'} target='_blank' style={{position:'relative', cursor:'pointer'}}>
                    <Icon name='bell' style={{color:'#000'}}/>
                    <Label color='red' floating style={{display:notificationCount>0?"":"none", borderRadius:'16px', fontSize: '10px', padding: '4px'}}>
                        {notificationCount}
                    </Label>
                </Menu.Item>
                <Icon name='setting' onClick={onClickSetting}/>
                {displaySettingLayer()}
                <Dropdown trigger={rightBtnTrigger} options={[
                    { key: 'logout', text: 'Logout', onClick: onClickLogout }
                ]} />
            </div>;
        }
    }

    const onClickSetting = e => {
        if (clickedSetting) {
            setClickSetting(false);
        } else {
            setClickSetting(true);
        }
    }

    const displaySettingLayer = () => {
        if (clickedSetting) {
            return <div className="setting-layer">
                <div className="ui checkbox">
                    <input type="checkbox" checked={useAlarmClock.clockIn} onChange={onCheckUseClockInTime} />
                    <label>출근 시간(<span>{userInfo.workStartTime}</span>) 체크 알림 (5분 전)</label>
                </div>
                <div className="ui checkbox">
                    <input type="checkbox" checked={useAlarmClock.clockOut} onChange={onCheckUseClockOutTime} />
                    <label>퇴근 시간(<span>{userInfo.workEndTime}</span>) 체크 알림 (정시)</label>
                </div>
            </div>;
        }
    }

    const onCheckUseClockInTime = e => {
        const data = {
            clockIn: e.target.checked,
            clockOut: useAlarmClock.clockOut
        }
        setUseAlarmClock(data);
        ipcRenderer.send('daouoffice.setUseAlarmClock', data);
    }

    const onCheckUseClockOutTime = e => {
        const data = {
            clockIn: useAlarmClock.clockIn,
            clockOut: e.target.checked
        }

        setUseAlarmClock(data);
        ipcRenderer.send('daouoffice.setUseAlarmClock', data);
    }

    const onClickRefresh = () => {
        findList();
        findDayoffList();
    }

    const onClickLogin = () => {
        ipcRenderer.send('daouoffice.openLoginPage');
    }

    const onClickLogout = () => {
        ipcRenderer.send('daouoffice.logout');
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

    const displayExtraButtons = () => {
        if (authenticated && userInfo) {
            return <div style={{"marginBottom":"5px"}}>
                <Button.Group>
                    <Popup
                        content={userInfo.clockInTime}
                        open={!!userInfo.clockedIn}
                        trigger={<Button onClick={onClockIn} disabled={!!userInfo.clockedIn}>출근하기</Button>}
                    />
                    <Button.Or />
                    <Popup
                        content={userInfo.clockOutTime}
                        open={!!userInfo.clockedOut}
                        trigger={<Button onClick={onClockOut} positive disabled={!!userInfo.clockedOut}>퇴근하기</Button>}
                    />
                </Button.Group>
                &nbsp;
                <Button.Group>
                    <Button>바로가기</Button>
                    <Dropdown
                        className='button icon'
                        floating
                        options={[
                            { key: '1', icon: 'discussions', selected: true, text: '회의실 예약', href: 'https://spectra.daouoffice.com/app/asset', target: '_blank'},
                            { key: '2', icon: 'address book', selected: true, text: '주소록', href: 'https://spectra.daouoffice.com/app/contact/dept/2752', target: '_blank'},
                        ]}
                        trigger={<></>}
                    />
                </Button.Group>
            </div>
        }
    }

    return (
        <Card fluid>
            <Card.Content>
                <Card.Header>
                    <div className="ui header">
                        <img src={daouofficeIcon} alt="" className="header-icon"/>
                        Daouoffice
                    </div>
                    {displayRightMenu()}
                </Card.Header>

                {displayListLayer()}

            </Card.Content>

            <Card.Content extra>

                { displayExtraButtons() }

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
