import React from 'react';
import {Image, List} from 'semantic-ui-react';
import UiShare  from '../../UiShare';

const RecentJobList = props => {
    if (props.list == null) {
        return UiShare.displayListLoading();
    } else {
        return props.list.map(item => {
            const { id, timestamp, issueKey, containerName, name, type, url, iconUrl } = item;

            return <List.Item key={issueKey}>
                <Image avatar src={iconUrl} />
                <List.Content className='image_content'>
                    <List.Header>
                        <a href={`https://enomix.atlassian.net/browse/${issueKey}`} rel="noreferrer" target="_blank">{name}</a>
                    </List.Header>
                    <List.Description>{issueKey} | {containerName}</List.Description>
                </List.Content>
            </List.Item>;
        });
    }
};

export default RecentJobList;
