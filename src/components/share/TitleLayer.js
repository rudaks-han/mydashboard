import React from 'react';

function TitleLayer({ title, icon }) {
    return (
        <div className="ui header">
            {
                icon ? <img src={icon} alt="" className="header-icon"/> : ''
            }
            {title}
        </div>
    );
};

export default TitleLayer;
