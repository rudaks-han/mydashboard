import React from 'react';
import {List, Tab} from 'semantic-ui-react';
import RecentJobList from "./RecentJobList";
import LoginLayer from "../share/LoginLayer";
import AssignToMeList from "./AssignToMeList";
import RecentProjectList from "./RecentProjectList";

const ContentLayer = props => {
    if (props.authenticated) {
        return (
            <div className="list-layer">
                <Tab panes={[
                    {
                        menuItem: '최근 작업', render: () =>
                            <Tab.Pane>
                                <List divided relaxed>
                                    <RecentJobList list={props.recentJobList} />
                                </List>
                            </Tab.Pane>
                    },
                    {
                        menuItem: '나에게 할당됨', render: () =>
                            <Tab.Pane>
                                <List divided relaxed>
                                    <AssignToMeList list={props.assignToMeList} />
                                </List>
                            </Tab.Pane>
                    },
                    {
                        menuItem: '최근 프로젝트', render: () =>
                            <Tab.Pane>
                                <List divided relaxed>
                                    <RecentProjectList list={props.recentProjectList} />
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
