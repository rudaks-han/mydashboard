import React from 'react';
import { List } from 'semantic-ui-react'
import UiShare from '../../UiShare';

const CompanyBoardList = props => {
    const displayListItem = () => {
        if (props.list == null) {
            return UiShare.displayListLoading();
        } else {
            return props.list.map(item => {
                const { id, title, readPost, createdAt, writer } = item;
                let createdAtFormat = createdAt.substring(0, 16);
                createdAtFormat = createdAtFormat.replace(/T/, ' ');

                let readFlagStyle = '';
                if (readPost) {
                    readFlagStyle = 'normal';
                }

                return (
                    <List.Item key={id}>
                        <List.Content>
                            <List.Header>
                                <a href={`https://spectra.daouoffice.com/app/board/2302/post/${id}`} rel="noreferrer" target="_blank" style={{fontWeight:readFlagStyle}}>{title}</a>
                            </List.Header>
                            <List.Description>{createdAtFormat} {writer.name} {writer.positionName}</List.Description>
                        </List.Content>
                    </List.Item>
                );
            });
        }
    }

    return (
        <List divided relaxed style={{height: '200px'}}>
            {displayListItem()}
        </List>
    )
};

export default CompanyBoardList;
