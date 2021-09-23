import React from 'react';
import {Dropdown} from 'semantic-ui-react';

const getOptions = (from, to) => {
    let result = [];
    for (let i=from; i<=to; i++) {
        result.push({ key: i, text: `${i}분`, value: i });
    }

    return result;
}

const DropdownTime = props => (
    <Dropdown
        options={getOptions(props.from, props.to)}
        selection
        onChange={props.onChange}
        value={props.value}
    />
)

export default DropdownTime;
