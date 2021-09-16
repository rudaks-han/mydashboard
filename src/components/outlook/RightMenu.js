import React from 'react';
import {Dropdown, Icon, Label, Menu} from 'semantic-ui-react';

function RightMenu({authenticated, onClickRefresh, onClickLogout, openOutlook, unreadCount}) {
    const rightBtnTrigger = (
        <span>
            <Icon name='user' />
        </span>
    )

    if (authenticated) {
        return <div className="btn-right-layer">
            <Icon name='expand arrows alternate' className='component-move'/>
            <Icon name='refresh' onClick={onClickRefresh}/>
            <Menu.Item as='a' style={{position:'relative', cursor:'pointer'}} onClick={openOutlook}>
                <Icon name='bell' style={{color:'#000'}}/>
                <Label color='red' floating style={{display:unreadCount>0?"":"none", borderRadius:'16px', fontSize: '10px', padding: '4px'}}>
                    {unreadCount}
                </Label>
            </Menu.Item>
            <Dropdown trigger={rightBtnTrigger} options={[
                { key: 'logout', text: 'Logout', onClick: onClickLogout }
            ]} />
        </div>;
    } else {
        return '';
    }
};

export default RightMenu;
