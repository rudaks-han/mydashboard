import React from 'react';
import { List, Image } from 'semantic-ui-react';
import UiShare  from '../../UiShare';

const RecentJobList = props => {
    if (props.list == null) {
        return UiShare.displayListLoading();
    } else {
        return props.list.map(item => {
            const { issueId, issueKey, summary, projectName, iconUrl } = item;

            return <List.Item key={issueKey}>
                <Image avatar src={iconUrl} />
                <List.Content className='image_content'>
                    <List.Header>
                        <a href={`https://enomix.atlassian.net/browse/${issueKey}`} rel="noreferrer" target="_blank">{summary}</a>
                    </List.Header>
                    <List.Description>{issueKey} | {projectName}</List.Description>
                </List.Content>
            </List.Item>;
        });
    }
};

export default RecentJobList;
