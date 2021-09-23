import React from 'react';
import {Icon} from 'semantic-ui-react';
import SettingModal from "../sonarqube/SettingModal";

const RightMenu = props => {

    return (
        <div className="btn-right-layer">
            <Icon name='expand arrows alternate' className='component-move'/>
            <Icon name='refresh' onClick={props.onClickRefresh}/>
            <SettingModal
                {...props}
            />
        </div>
    )
};

export default RightMenu;
