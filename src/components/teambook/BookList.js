import React from 'react';
import {List} from 'semantic-ui-react';
import UiShare from '../../UiShare';

const BookList = props => {

    const displayListItem = () => {

        console.log('props.bookList')
        console.log(props.list)
        if (props.list == null) {
            return UiShare.displayListLoading();
        } else {
            return props.list.map(item => {
                const { index, month, date, bookName, username, link} = item;

                return <List.Item key={index}>
                    <List.Content>
                        <List.Header>
                            <a href={link} rel="noreferrer" target="_blank">[{month}] {bookName}</a>
                        </List.Header>
                        <List.Description>
                            {date} | {username}
                        </List.Description>
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

export default BookList;
