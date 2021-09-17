import React from 'react';
import {Dropdown, Icon, List} from 'semantic-ui-react';
import UiShare  from '../../UiShare';

const RightMenu = props => {
    const rightBtnTrigger = (
        <span>
            <Icon name='user' />
        </span>
    )

    if (props.authenticated) {
        return (
            <div className="btn-right-layer">
                <Icon name='expand arrows alternate' className='component-move'/>
                <Icon name='refresh' onClick={props.onClickRefresh} />
                <Dropdown trigger={rightBtnTrigger} options={[
                    { key: 'logout', text: 'Logout', onClick: props.onClickLogout }
                ]} />
            </div>
        );
    } else {
        return '';
    }
};

export default RightMenu;
