import React from 'react';
import {List} from 'semantic-ui-react'
import UiShare from '../../UiShare';

const InboxList = props => {
    const displayListItem = () => {
        if (props.list == null) {
            return UiShare.displayListLoading();
        } else {
            return props.list.conversations.map(item => {
                const {ConversationId, UniqueSenders, ConversationTopic, LastDeliveryTime, UnreadCount} = item;
                const id = ConversationId.Id;
                let lastDeliveryTime = LastDeliveryTime;

                lastDeliveryTime = lastDeliveryTime.replace(/T/, ' ');
                lastDeliveryTime = lastDeliveryTime.substring(0, 16);

                let readFlagStyle = '';
                if (UnreadCount === 0) {
                    readFlagStyle = 'normal';
                }

                return <List.Item key={id}>
                    <List.Content>
                        <List.Header>
                            <a rel="noreferrer" target="_blank" onClick={props.openOutlook}
                               style={{fontWeight: readFlagStyle}}>{ConversationTopic}</a>
                        </List.Header>
                        <List.Description>{UniqueSenders} | {lastDeliveryTime}</List.Description>
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

export default InboxList;
