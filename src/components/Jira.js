import React, { useState, useEffect, useContext, useRef } from 'react';
import jiraIcon from '../static/image/icons8-jira-100.png';
import { Card, List, Tab, Button, Segment, Header } from 'semantic-ui-react'
import UiShare  from '../UiShare';
import TimerContext from "../TimerContext";
import RecentJobList from "./jira/RecentJobList";
import RightMenu from "./jira/RightMenu";
import ContentLayer from "./jira/ContentLayer";
import AddLinkLayer from "./share/AddLinkLayer";
import TitleLayer from "./share/TitleLayer";
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
                    <TitleLayer title="Jira" icon={jiraIcon} />
                    <RightMenu authenticated={authenticated} onClickRefresh={onClickRefresh} onClickLogout={onClickLogout} />
                </Card.Header>
                <ContentLayer
                    authenticated={authenticated}
                    list={list}
                    onClickLogin={onClickLogin}
                />
            </Card.Content>
            <Card.Content extra>
                <AddLinkLayer href="https://enomix.atlassian.net/jira/your-work" />
            </Card.Content>
        </Card>
    )
};

export default Jira;
