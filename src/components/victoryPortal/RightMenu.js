import React from 'react';
import {Dropdown, Icon, List} from 'semantic-ui-react';
import UiShare  from '../../UiShare';

function RightMenu({onClickRefresh}) {
    return (
        <div className="btn-right-layer">
            <Icon name='expand arrows alternate' className='component-move'/>
            <Icon name='refresh' onClick={onClickRefresh}/>
        </div>
    )
};

export default RightMenu;
