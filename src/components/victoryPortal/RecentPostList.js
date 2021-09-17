import React from 'react';
import {List} from 'semantic-ui-react';
import UiShare from '../../UiShare';

const RecentPostList = props => {
    const displayListItem = () => {
        if (props.list == null) {
            return UiShare.displayListLoading();
        } else {
            return props.list.map(item => {
                const { id, date, link, title } = item;

                return <List.Item key={id}>
                    <List.Content>
                        <List.Header>
                            <a href={link} rel="noreferrer" target="_blank">{title.rendered}</a>
                        </List.Header>
                        <List.Description>{date.substring(0, 10)}</List.Description>
                    </List.Content>
                </List.Item>;
            });
        }
    }

    return (
        <List divided relaxed>
            {displayListItem()}
        </List>
    )
};

export default RecentPostList;
