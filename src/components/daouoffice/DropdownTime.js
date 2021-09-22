import React from 'react';
import {Dropdown} from 'semantic-ui-react';

const getOptions = (count) => {
    let result = [];
    for (let i=1; i<=count; i++) {
        result.push({ key: i, text: `${i}분`, value: i });
    }

    return result;
}

const DropdownTime = props => (
    <Dropdown
        options={getOptions(props.count)}
        selection
        onChange={props.onChange}
        value={props.value}
    />
)

export default DropdownTime;
