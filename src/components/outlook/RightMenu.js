import React from 'react';
import {Dropdown, Icon, Label, Menu} from 'semantic-ui-react';

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
            <Menu.Item as='a' style={{position:'relative', cursor:'pointer'}} onClick={props.openOutlook}>
                <Icon name='bell' style={{color:'#000'}}/>
                <Label color='red' floating style={{display:props.unreadCount>0?"":"none", borderRadius:'16px', fontSize: '10px', padding: '4px'}}>
                    {props.unreadCount}
                </Label>
            </Menu.Item>
            <Dropdown trigger={rightBtnTrigger} options={[
                { key: 'logout', text: 'Logout', onClick: props.onClickLogout }
            ]} />
        </div>;
    } else {
        return '';
    }
};

export default RightMenu;
