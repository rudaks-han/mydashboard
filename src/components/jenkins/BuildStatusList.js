import React from 'react';
import {Item, Label} from 'semantic-ui-react'
import UiShare from '../../UiShare';

const BuildStatusList = props => {
    const displayListItem = () => {
        if (props.list == null) {
            return UiShare.displayListLoading();
        } else {
            let hasError = false;
            let errorMessage = '';
            const result = props.list.map(item => {
                let lastBuildResult = false;
                let color = 'green';
                const moduleName = item.moduleName;
                let lastCommitClassName = '';
                if (item.result === 'SUCCESS') {
                    lastBuildResult = true;
                    lastCommitClassName = 'hide';
                } else {
                    hasError = true;
                    color = 'red';
                    errorMessage += `${moduleName} failed \n`;
                }
                let authorName = item.lastCommit.authorName || '';
                let comment = item.lastCommit.comment || '';
                let date = item.lastCommit.date && item.lastCommit.date.substring(0, 16) || '';
                const freshness = item.timestamp > 0 ? toDate(item.timestamp) : '-';

                return (
                    <Item key={moduleName}>
                        <Item.Image size='mini'>
                            <Label circular color={color} key={color} className='image padding20' style={{verticalAlign:'middle', fontSize: '20px'}}>
                                {lastBuildResult?'A':'E'}
                            </Label>
                        </Item.Image>

                        <Item.Content>
                            <Item.Header>
                                <a rel="noreferrer" href={`http://211.63.24.41:8080/view/victory/job/${moduleName}`} target='_blank'>{moduleName}</a>
                            </Item.Header>
                            <Item.Meta>
                                Last build on {freshness}
                            </Item.Meta>
                            <Item.Description className={lastCommitClassName}>
                                Last commit on {date} by {authorName}
                            </Item.Description>
                            <Item.Extra className={lastCommitClassName}>
                                {comment}
                            </Item.Extra>
                        </Item.Content>
                    </Item>
                )
            });

            props.setBuildErrorMessage(errorMessage);

            return result;
        }
    }

    const toDate = (timestamp) => {
        return UiShare.timeSince(timestamp) + ' ago';
    }

    return (
        <Item.Group style={{'height': '300px'}}>
            {displayListItem()}
        </Item.Group>
    )
};

export default BuildStatusList;
