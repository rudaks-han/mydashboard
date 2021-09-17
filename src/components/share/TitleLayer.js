import React from 'react';

const TitleLayer = props => {
    return (
        <div className="ui header">
            {
                props.icon ? <img src={props.icon} alt="" className="header-icon"/> : ''
            }
            {props.title}
        </div>
    );
};

export default TitleLayer;
