import React from 'react';
import {Tab} from 'semantic-ui-react';
import RecentPostList from "./RecentPostList";

const ContentLayer = props => {
    return (
        <div className="list-layer">
            <Tab panes={[
                { menuItem: '최근 글', render: () =>
                        <Tab.Pane>
                            <RecentPostList list={props.list} />
                        </Tab.Pane>}
            ]} />
        </div>
    )
};

export default ContentLayer;
