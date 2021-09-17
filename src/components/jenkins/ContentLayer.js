import React from 'react';
import {Label} from 'semantic-ui-react';
import BuildStatusList from "./BuilStatusList";
import LoginLayer from "../share/LoginLayer";

const ContentLayer = props => {
    if (props.authenticated) {
        return (
            <div>
                <Label color='teal' ribbon='right' style={{top: '-10px'}}>
                    Last update: {props.lastUpdated}
                </Label>
                <div className="list-layer">
                    <BuildStatusList
                        list={props.list}
                        setBuildErrorMessage={props.setBuildErrorMessage}
                    />
                </div>
            </div>
        );
    } else {
        return <LoginLayer {...props} />
    }
};

export default ContentLayer;
