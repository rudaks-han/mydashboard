import React from 'react';
import { List } from 'semantic-ui-react';
import UiShare  from '../../UiShare';

function RecentJobList({list}) {
    if (list == null) {
        return UiShare.displayListLoading();
    } else {
        return list.map(item => {
            const issueKey = item.object.extension.issueKey;
            const name = item.object.name;
            const containerName = item.object.containers[1].name;

            return <List.Item key={issueKey}>
                <List.Content>
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
