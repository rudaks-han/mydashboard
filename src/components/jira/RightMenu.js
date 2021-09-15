import React from 'react';
import {Dropdown, Icon, List} from 'semantic-ui-react';
import UiShare  from '../../UiShare';

function RightMenu({authenticated, onClickRefresh, onClickLogout}) {
    const rightBtnTrigger = (
        <span>
            <Icon name='user' />
        </span>
    )

    console.log(authenticated)
    if (authenticated) {
        return (
            <div className="btn-right-layer">
                <Icon name='expand arrows alternate' className='component-move'/>
                <Icon name='refresh' onClick={onClickRefresh} />
                <Dropdown trigger={rightBtnTrigger} options={[
                    { key: 'logout', text: 'Logout', onClick: onClickLogout }
                ]} />
            </div>
        );
    } else {
        return '';
    }
};

export default RightMenu;
