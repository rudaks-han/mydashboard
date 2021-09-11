import React, { useState, useEffect, useContext } from 'react';
import jiraIcon from '../static/image/icons8-jira-100.png';
import { Card, Icon, Dropdown, List, Tab, Button, Segment, Header } from 'semantic-ui-react'
import UiShare  from '../UiShare';
import {clearIntervalAsync, setIntervalAsync} from "set-interval-async/dynamic";
const { ipcRenderer } = window.require('electron');

function Jira() {
    const [list, setList] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        findList();
    }, []);

    useEffect(() => {
        const timer = setIntervalAsync(
            async () => {
                console.log('[jira] scheduler ==> findList ' + UiShare.getCurrTime())
                findList();
            }, 1000 * 60 * 60
        );

        return () => {
            (async () => {
                if (timer) {
                    await clearIntervalAsync(timer);
                }
            })();
        };
    }, [])

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

    const rightBtnTrigger = (
        <span>
            <Icon name='user' />
        </span>
    )

    const displayListLayer = () => {
        if (authenticated) {
            return (
                <div className="list-layer">
                    <Tab panes={[
                        { menuItem: '최근 작업', render: () =>
                                <Tab.Pane>
                                    <List divided relaxed>
                                        {displayListItem()}
                                    </List>
                                </Tab.Pane>}
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

    const displayListItem = () => {
        if (list == null) {
            return UiShare.displayListLoading();
        } else {
            return list.map(item => {
                const issueKey = item.object.extension.issueKey;
                const name = item.object.name;
                const containerName = item.object.containers[1].name;

                return <List.Item key={issueKey}>
                    <List.Content>
                        <List.Header>
                            <a href={`https://enomix.atlassian.net/browse/${issueKey}`} rel="noreferrer" target="_blank">{name}</a>
                        </List.Header>
                        <List.Description>{issueKey} | {containerName}</List.Description>
                    </List.Content>
                </List.Item>;
            });
        }
    }

    const displayRightMenu = () => {
        if (authenticated) {
            return (
                <div className="btn-right-layer">
                    <Icon name='expand arrows alternate' className='component-move'/>
                    <Icon name='refresh' onClick={onClickRefresh} />
                    <Dropdown trigger={rightBtnTrigger} options={[
                        { key: 'logout', text: 'Logout', onClick: onClickLogout }
                    ]} />
                </div>
            );
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

                    {displayRightMenu()}

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
