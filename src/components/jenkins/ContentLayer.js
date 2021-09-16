import React from 'react';
import {Button, Header, Label, Segment} from 'semantic-ui-react';
import BuildStatusList from "./BuilStatusList";
import jenkinsIcon from "../../static/image/jenkins.png";

function ContentLayer(props) {
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
        return <Segment placeholder>
            <Header icon>
                <img src={jenkinsIcon} alt="" className="component-icon"/>
                Jira에 로그인
            </Header>
            <Button primary onClick={props.onClickLogin}>Login</Button>
        </Segment>;
    }
};

export default ContentLayer;
