import React, {useContext, useEffect, useState} from 'react';
import jenkinsIcon from '../../static/image/jenkins.png';
import {Card} from 'semantic-ui-react'
import UiShare from '../../UiShare';
import TimerContext from "../../TimerContext";
import RightMenu from "./RightMenu";
import AddLinkLayer from "../share/AddLinkLayer";
import TitleLayer from "../share/TitleLayer";
import ContentLayer from "./ContentLayer";

const { ipcRenderer } = window.require('electron');

const Jenkins = () => {
    const [list, setList] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [useAlarmOnError, setUseAlarmOnError] = useState(false);
    const [checkedModuleNameList, setCheckedModuleNameList] = useState([]);
    const [jobList, setJobList] = useState([]);
    const [clickedSetting, setClickSetting] = useState(false);
    const [lastUpdated, setLastUpdated] = useState('');
    const tickTime = useContext(TimerContext);

    let buildErrorMessage;

    useEffect(() => {
        findList();
        findModuleList();
        findUseAlarmOnError();
    }, []);

    useEffect(() => {
        if (tickTime == null) return;
        if (!authenticated) return;
        const { hour, minute } = UiShare.getDateTimeFormat(tickTime);
        if (minute%10 === 0) {
            findModuleList();
        }
        if ((hour === 10 && minute === 0) || (hour === 15 && minute === 0)) {
            findList();
            setTimeout(() => {
                if (useAlarmOnError && buildErrorMessage) {
                    UiShare.showNotification(buildErrorMessage, 'Jenkins');
                }
            }, 1000*5);
        }
    }, [tickTime, authenticated]);

    const findUseAlarmOnError = () => {
        ipcRenderer.send('jenkins.findUseAlarmOnError');
        ipcRenderer.on('jenkins.findUseAlarmOnErrorCallback', (e, data) => {
            setUseAlarmOnError(data);
            ipcRenderer.removeAllListeners('jenkins.findUseAlarmOnErrorCallback');
        });
    }

    const findModuleList = () => {
        ipcRenderer.send('jenkins.findModuleList');
        ipcRenderer.removeAllListeners('jenkins.findModuleListCallback');
        ipcRenderer.on('jenkins.findModuleListCallback', (e, data) => {
            const jobs = data.data;
            const availableModules = data.availableModules;
            const filteredJobs = filterJobs(jobs);
            const checkedModuleNames = availableModules.map(module => module.name);
            setCheckedModuleNameList(checkedModuleNames);
            setJobList(filteredJobs);
        });
    }

    const filterJobs = (jobs) => {
        return jobs.filter(job => {
            if (job._class === 'org.jenkinsci.plugins.workflow.multibranch.WorkflowMultiBranchProject') {
                if (job.name.startsWith('core-asset-')) {
                    return job;
                } else if (job.name.startsWith('talk-api-')) {
                    return job;
                }
            }

            return null;
        });
    }

    const findList = () => {
        setList(null);
        ipcRenderer.send('jenkins.findList');
        ipcRenderer.removeAllListeners('jenkins.findListCallback');
        ipcRenderer.on('jenkins.findListCallback', (e, data) => {
            setList(data);
            setLastUpdated(UiShare.getCurrDate() + " " + UiShare.getCurrTime());
        });

        ipcRenderer.removeAllListeners('jenkins.authenticated');
        ipcRenderer.on('jenkins.authenticated', (e, data) => {
            setAuthenticated(data);
        });
    }

    const setBuildErrorMessage = msg => {
        buildErrorMessage = msg;
    }

    const onClickSetting = e => {
        if (clickedSetting) {
            setClickSetting(false);
        } else {
            setClickSetting(true);
        }
    }

    const onChangeUseAlarm = (e, data) => {
        const { checked } = data;
        setUseAlarmOnError(checked);
        ipcRenderer.send('jenkins.useAlarmOnError', checked);
    }

    const onChangeModuleChange = (e, data) => {
        const { name, value, checked } = data; // value: branch

        if (checked) {
            ipcRenderer.send('jenkins.addAvailableModule', {name, value});
            const newModules = [...checkedModuleNameList, name];
            setCheckedModuleNameList(newModules);
        } else {
            ipcRenderer.send('jenkins.removeAvailableModule', {name, value});
            const newModules = checkedModuleNameList.filter(item => item !== name);
            setCheckedModuleNameList(newModules);
        }

        findList();
    }

    const onClickRefresh = () => {
        findList();
    }

    const onClickLogin = () => {
        ipcRenderer.send('jenkins.openLoginPage');
    }

    const onClickLogout = () => {
        ipcRenderer.send('jenkins.logout');
    }

    return (
        <Card fluid>
            <Card.Content>
                <Card.Header>
                    <TitleLayer title="Jenkins" icon={jenkinsIcon} />
                    <RightMenu
                        jobList={jobList}
                        checkedModuleNameList={checkedModuleNameList}
                        authenticated={authenticated}
                        onClickRefresh={onClickRefresh}
                        onClickSetting={onClickSetting}
                        onChangeModuleChange={onChangeModuleChange}
                        onClickLogout={onClickLogout}
                        clickedSetting={clickedSetting}
                        useAlarmOnError={useAlarmOnError}
                        onChangeUseAlarm={onChangeUseAlarm}
                    />
                </Card.Header>
                <ContentLayer
                    authenticated={authenticated}
                    lastUpdated={lastUpdated}
                    list={list}
                    title="Jenkins"
                    icon={jenkinsIcon}
                    setBuildErrorMessage={setBuildErrorMessage}
                    onClickLogin={onClickLogin}
                />
            </Card.Content>
            <Card.Content extra>
                <AddLinkLayer href="http://211.63.24.41:8080/view/victory/" />
            </Card.Content>
        </Card>
    )
};

export default Jenkins;
