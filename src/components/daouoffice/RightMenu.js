import React from 'react';
import {Dropdown, Icon, Label, List, Menu} from 'semantic-ui-react';
import UiShare  from '../../UiShare';

function RightMenu({authenticated, userInfo, clickedSetting, setClickSetting, findList, findDayoffList,
                       notificationCount, useAlarmClock, setUseAlarmClock}) {
    const rightBtnTrigger = (
        <span>
            <Icon name='user' />
        </span>
    )

    const onClickSetting = e => {
        if (clickedSetting) {
            setClickSetting(false);
        } else {
            setClickSetting(true);
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

    const onClickLogout = () => {
        ipcRenderer.send('daouoffice.logout');
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
    } else {
        return null;
    }
};

export default RightMenu;
