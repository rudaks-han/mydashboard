import React, {useState, useEffect, useContext} from 'react';
import outlookIcon from '../static/image/outlook.png';
import {Card, Icon, Dropdown, List, Tab, Button, Segment, Header, Label, Menu} from 'semantic-ui-react'
import UiShare  from '../UiShare';
import TimerContext from "../TimerContext";
import RightMenu from "./outlook/RightMenu";
import InboxList from "./outlook/InboxList";
const { ipcRenderer } = window.require('electron');

function Outlook() {
    const [list, setList] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const tickTime = useContext(TimerContext);

    useEffect(() => {
        findList();
    }, []);

    useEffect(() => {
        if (tickTime == null) return;
        if (!authenticated) return;
        const { minute } = UiShare.getTimeFormat(tickTime);
        if (minute%10 === 0) {
            findList();
        }
    }, [tickTime, authenticated]);

    const findList = () => {
        setList(null);
        ipcRenderer.send('outlook.findList');
        ipcRenderer.removeAllListeners('outlook.findListCallback');
        ipcRenderer.on('outlook.findListCallback', async (e, data) => {
            setList(data);
            setUnreadCount(data.unreadCount);
        });

        ipcRenderer.removeAllListeners('outlook.authenticated');
        ipcRenderer.on('outlook.authenticated', async (e, data) => {
            setAuthenticated(data);
        });
    }

    const displayListLayer = () => {
        if (authenticated) {
            return (
                <div className="list-layer">
                    <Tab panes={[
                        { menuItem: '받은 편지함', render: () =>
                                <Tab.Pane>
                                    <InboxList
                                        list={list}
                                        openOutlook={openOutlook}
                                    />
                                </Tab.Pane>}
                    ]} />
                </div>
            )
        } else {
            return <Segment placeholder>
                <Header icon>
                    <img src={outlookIcon} alt="" className="component-icon"/>
                    Outlook에 로그인
                </Header>
                <Button primary onClick={onClickLogin}>Login</Button>
            </Segment>;
        }
    }

    const onClickRefresh = () => {
        findList();
    }

    const onClickLogin = () => {
        ipcRenderer.send('outlook.openLoginPage');
    }

    const onClickLogout = () => {
        ipcRenderer.send('outlook.logout');
    }

    const openOutlook = () => {
        ipcRenderer.send('outlook.openOutlook');
    }

    return (
        <Card fluid>
            <Card.Content>
                <Card.Header>
                    <div className="ui header">
                        <img src={outlookIcon} alt="" className="header-icon"/>
                        outlook
                    </div>
                    <RightMenu
                        authenticated={authenticated}
                        onClickRefresh={onClickRefresh}
                        onClickLogout={onClickLogout}
                        openOutlook={openOutlook}
                        unreadCount={unreadCount}
                    />
                </Card.Header>

                {displayListLayer()}

            </Card.Content>
            <Card.Content extra>
                <Button fluid color="blue" onClick={openOutlook}>
                    Outlook 열기
                </Button>
            </Card.Content>
        </Card>
    )
};

export default Outlook;
