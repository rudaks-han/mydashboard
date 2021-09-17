import React from 'react';
import {Button, Header, Segment} from "semantic-ui-react";

const LoginLayer = props => {
    return (
        <Segment placeholder>
            <Header icon>
                <img src={props.icon} alt="" className="component-icon"/>
                {props.title}에 로그인
            </Header>
            <Button primary onClick={props.onClickLogin}>Login</Button>
        </Segment>
    );
};

export default LoginLayer;
