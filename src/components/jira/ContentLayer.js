import React from 'react';
import {List, Tab} from 'semantic-ui-react';
import RecentJobList from "./RecentJobList";
import LoginLayer from "../share/LoginLayer";

const ContentLayer = props => {
    if (props.authenticated) {
        return (
            <div className="list-layer">
                <Tab panes={[
                    {
                        menuItem: '최근 작업', render: () =>
                            <Tab.Pane>
                                <List divided relaxed>
                                    <RecentJobList list={props.list} />
                                </List>
                            </Tab.Pane>
                    }
                ]} />
            </div>
        )
    } else {
        return <LoginLayer {...props} />
    }
};

export default ContentLayer;
