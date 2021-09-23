import React from 'react';
import {Dropdown, Icon, Label, Menu} from 'semantic-ui-react';
import SettingModal from "./SettingModal";

const RightMenu = props => {
    const rightBtnTrigger = (
        <span>
            <Icon name='user' />
        </span>
    )

    const onClickLogout = () => {
        ipcRenderer.send('daouoffice.logout');
    }

    if (props.authenticated && props.userInfo) {
        return <div className="btn-right-layer">
            <Icon name='expand arrows alternate' className='component-move'/>
            <Icon name='refresh' onClick={props.onClickRefresh}/>
            <Menu.Item as='a' href={'https://spectra.daouoffice.com/app/noti/unread'} target='_blank' style={{position:'relative', cursor:'pointer'}}>
                <Icon name='bell' style={{color:'#000'}}/>
                <Label color='red' floating style={{display:props.notificationCount>0?"":"none", borderRadius:'16px', fontSize: '10px', padding: '4px'}}>
                    {props.notificationCount}
                </Label>
            </Menu.Item>
            <SettingModal
                useAlarmClock={props.useAlarmClock}
                userInfo={props.userInfo}
                setUseAlarmClock={props.setUseAlarmClock}
            />
            <Dropdown trigger={rightBtnTrigger} options={[
                { key: 'logout', text: 'Logout', onClick: onClickLogout }
            ]} />
        </div>;
    } else {
        return null;
    }
};

export default RightMenu;
