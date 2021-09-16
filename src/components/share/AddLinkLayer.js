import React from 'react';
import {Button} from 'semantic-ui-react'

function AddLinkLayer({ href, onClick, text }) {
    return (
        <Button fluid color="blue" as='a' href={href} rel="noreferrer" target='_blank' onClick={onClick}>
            {text ? text : "바로 가기"}
        </Button>
    );
};

export default AddLinkLayer;
