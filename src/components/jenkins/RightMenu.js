import React from 'react';
import {Dropdown, Icon} from 'semantic-ui-react';
import SettingLayer from "./SettingLayer";

const RightMenu = props => {
    const rightBtnTrigger = (
        <span>
            <Icon name='user' />
        </span>
    )

    if (props.authenticated) {
        return <div className="btn-right-layer">
            <Icon name='expand arrows alternate' className='component-move'/>
            <Icon name='refresh' onClick={props.onClickRefresh}/>
            <Icon name='setting' onClick={props.onClickSetting}/>
            <SettingLayer {...props} />
            <Dropdown trigger={rightBtnTrigger} options={[
                { key: 'logout', text: 'Logout', onClick: props.onClickLogout }
            ]} />
        </div>;
    } else {
        return null;
    }
};

export default RightMenu;
