import React from 'react';
import {Button, Header, Segment, Tab} from 'semantic-ui-react';
import InboxList from "./InboxList";

function ContentLayer(props) {
    if (props.authenticated) {
        return (
            <div className="list-layer">
                <Tab panes={[
                    { menuItem: '받은 편지함', render: () =>
                            <Tab.Pane>
                                <InboxList
                                    list={props.list}
                                    openOutlook={props.openOutlook}
                                />
                            </Tab.Pane>}
                ]} />
            </div>
        )
    } else {
        return <Segment placeholder>
            <Header icon>
                <img src={props.outlookIcon} alt="" className="component-icon"/>
                Outlook에 로그인
            </Header>
            <Button primary onClick={props.onClickLogin}>Login</Button>
        </Segment>;
    }
};

export default ContentLayer;
