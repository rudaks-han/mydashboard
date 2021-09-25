import React from 'react';
import {Icon} from 'semantic-ui-react';

const RightMenu = props => {
    return (
        <div className="btn-right-layer">
            <Icon name='expand arrows alternate' className='component-move'/>
            <Icon name='refresh' onClick={props.onClickRefresh}/>
        </div>
    )
};

export default RightMenu;
