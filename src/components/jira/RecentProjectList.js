import React from 'react';
import {Image, List} from 'semantic-ui-react';
import UiShare  from '../../UiShare';

const RecentJobList = props => {
    if (props.list == null) {
        return UiShare.displayListLoading();
    } else {
        return props.list.map(item => {
            const { id, title, metadata, avatarUrl, url } = item;
            return <List.Item key={id}>
                <Image avatar src={avatarUrl} />
                <List.Content className='image_content'>
                    <List.Header>
                        <a href={url} rel="noreferrer" target="_blank">{title}</a>
                    </List.Header>
                    <List.Description>{metadata}</List.Description>
                </List.Content>
            </List.Item>;
        });
    }
};

export default RecentJobList;
