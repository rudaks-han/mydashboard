import React, { useState, useEffect, useContext, useRef } from 'react';
import jiraIcon from '../static/image/icons8-jira-100.png';
import { Card, List, Tab, Button, Segment, Header } from 'semantic-ui-react'
import UiShare  from '../UiShare';
import TimerContext from "../TimerContext";
import RecentJobList from "./jira/RecentJobList";
import RightMenu from "./jira/RightMenu";
const { ipcRenderer } = window.require('electron');

function Jira() {
    const [list, setList] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
    const tickTime = useContext(TimerContext);

    useEffect(() => {
        findList();
    }, []);

    useEffect(() => {
        if (tickTime == null) return;
        if (!authenticated) return;

        const { minute } = UiShare.getTimeFormat(tickTime);
        if (minute === 0) {
            findList();
        }
    }, [tickTime, authenticated]);

    const findList = () => {
        setList(null);
        ipcRenderer.send('jira.findList');
        ipcRenderer.removeAllListeners('jira.findListCallback');
        ipcRenderer.on('jira.findListCallback', async (e, data) => {
            setList(data);
        });

        ipcRenderer.removeAllListeners('jira.authenticated');
        ipcRenderer.on('jira.authenticated', async (e, data) => {
            setAuthenticated(data);
        });
    }

    const displayListLayer = () => {
        if (authenticated) {
            return (
                <div className="list-layer">
                    <Tab panes={[
                        {
                            menuItem: '최근 작업', render: () =>
                                <Tab.Pane>
                                    <List divided relaxed>
                                        <RecentJobList list={list} />
                                    </List>
                                </Tab.Pane>
                        }
                    ]} />
                </div>
            )
        } else {
            return <Segment placeholder>
                <Header icon>
                    <img src={jiraIcon} alt="" className="component-icon"/>
                    Jira에 로그인
                </Header>
                <Button primary onClick={onClickLogin}>Login</Button>
            </Segment>;
        }
    }

    const onClickRefresh = () => {
        findList();
    }

    const onClickLogin = () => {
        ipcRenderer.send('jira.openLoginPage');
    }

    const onClickLogout = () => {
        ipcRenderer.send('jira.logout');
    }

    return (
        <Card fluid>
            <Card.Content>
                <Card.Header>
                    <div className="ui header">
                        <img src={jiraIcon} alt="" className="header-icon"/>
                        Jira
                    </div>

                    <RightMenu authenticated={authenticated} onClickRefresh={onClickRefresh} onClickLogout={onClickLogout} />

                </Card.Header>

                {displayListLayer()}

            </Card.Content>
            <Card.Content extra>
                <Button fluid color="blue" as='a' href={'https://enomix.atlassian.net/jira/your-work'} rel="noreferrer" target='_blank'>
                    바로 가기
                </Button>
            </Card.Content>
        </Card>
    )
};

export default Jira;
