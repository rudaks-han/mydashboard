import React, {useContext, useEffect, useState} from 'react';
import jiraIcon from '../../static/image/icons8-jira-100.png';
import {Card} from 'semantic-ui-react'
import UiShare from '../../UiShare';
import TimerContext from "../../TimerContext";
import RightMenu from "./RightMenu";
import ContentLayer from "./ContentLayer";
import AddLinkLayer from "../share/AddLinkLayer";
import TitleLayer from "../share/TitleLayer";

const { ipcRenderer } = window.require('electron');

const Jira = () => {
    const [recentJobList, setRecentJobList] = useState(null);
    const [assignToMeList, setAssignToMeList] = useState(null);
    const [recentProjectList, setRecentProjectList] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
    const tickTime = useContext(TimerContext);

    useEffect(() => {
        findRecentJobList();
        findAssignToMeList();
        findRecentProjectList();
    }, []);

    useEffect(() => {
        if (tickTime == null) return;
        if (!authenticated) return;

        const { minute } = UiShare.getDateTimeFormat(tickTime);
        if (minute === 0) {
            findRecentJobList();
            findAssignToMeList();
            findRecentProjectList();
        }
    }, [tickTime, authenticated]);

    const findRecentJobList = () => {
        setRecentJobList(null);
        ipcRenderer.send('jira.findRecentJobList');
        ipcRenderer.removeAllListeners('jira.findRecentJobListCallback');
        ipcRenderer.on('jira.findRecentJobListCallback', async (e, data) => {
            setRecentJobList(data);
        });

        ipcRenderer.removeAllListeners('jira.authenticated');
        ipcRenderer.on('jira.authenticated', async (e, data) => {
            setAuthenticated(data);
        });
    }

    const findAssignToMeList = () => {
        ipcRenderer.send('jira.findAssignToMeList');
        ipcRenderer.removeAllListeners('jira.findAssignToMeListCallback');
        ipcRenderer.on('jira.findAssignToMeListCallback', async (e, data) => {
            setAssignToMeList(data);
        });
    }

    const findRecentProjectList = () => {
        ipcRenderer.send('jira.findRecentProjectList');
        ipcRenderer.removeAllListeners('jira.findRecentProjectListCallback');
        ipcRenderer.on('jira.findRecentProjectListCallback', async (e, data) => {
            setRecentProjectList(data);
        });
    }

    const onClickRefresh = () => {
        findRecentJobList();
        findAssignToMeList();
        findRecentProjectList();
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
                    recentJobList={recentJobList}
                    assignToMeList={assignToMeList}
                    recentProjectList={recentProjectList}
                    title="Jira"
                    icon={jiraIcon}
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
