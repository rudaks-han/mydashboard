import React from 'react';
import {Button, Header, List, Segment, Tab} from 'semantic-ui-react';
import RecentJobList from "./RecentJobList";

function ContentLayer(props) {
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
        return <Segment placeholder>
            <Header icon>
                <img src={props.jiraIcon} alt="" className="component-icon"/>
                Jira에 로그인
            </Header>
            <Button primary onClick={props.onClickLogin}>Login</Button>
        </Segment>;
    }
};

export default ContentLayer;
