import React from 'react';
import {Button} from 'semantic-ui-react'

const AddLinkLayer = props => {
    return (
        <Button fluid color="blue" as='a' href={props.href} rel="noreferrer" target='_blank' onClick={props.onClick}>
            {props.text ? props.text : "바로 가기"}
        </Button>
    );
};

export default AddLinkLayer;
