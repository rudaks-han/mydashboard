import React from 'react';
import {Dropdown, Icon, List} from 'semantic-ui-react';
import UiShare  from '../../UiShare';

const RightMenu = props => {
    return (
        <div className="btn-right-layer">
            <Icon name='expand arrows alternate' className='component-move'/>
            <Icon name='refresh' onClick={props.onClickRefresh}/>
        </div>
    )
};

export default RightMenu;
