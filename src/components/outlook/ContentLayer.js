import React from 'react';
import {Tab} from 'semantic-ui-react';
import InboxList from "./InboxList";
import LoginLayer from "../share/LoginLayer";

const ContentLayer = props => {
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
        return <LoginLayer {...props} />
    }
};

export default ContentLayer;
