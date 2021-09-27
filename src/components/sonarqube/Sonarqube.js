import React, {useContext, useEffect, useState} from 'react';
import sonarqubeIcon from '../../static/image/sonarqube-logo.png';
import {Card} from 'semantic-ui-react'
import UiShare from '../../UiShare';
import TimerContext from "../../TimerContext";
import AddLinkLayer from "../share/AddLinkLayer";
import TitleLayer from "../share/TitleLayer";
import RightMenu from "./RightMenu";
import ContentLayer from "./ContentLayer";

const { ipcRenderer } = window.require('electron');

const Sonarqube = () => {
    const [list, setList] = useState(null);
    const [checkedModuleNameList, setCheckedModuleNameList] = useState([]);
    const [componentList, setComponentList] = useState([]);
    const [useAlarmOnError, setUseAlarmOnError] = useState(false);
    const [lastUpdated, setLastUpdated] = useState('');
    const tickTime = useContext(TimerContext);
    let qualityErrorMessage;

    useEffect(() => {
        findList();
        findModuleList();
        findUseAlarmOnError();
    }, []);

    useEffect(() => {
        if (tickTime == null) return;
        const { hour, minute } = UiShare.getDateTimeFormat(tickTime);
        if ((hour === 10 && minute === 0) || (hour === 15 && minute === 0)) {
            findList();
            setTimeout(() => {
                if (useAlarmOnError && qualityErrorMessage) {
                    UiShare.showNotification(qualityErrorMessage, 'Sonarqube');
                }
            }, 1000*5);
        }
    }, [tickTime]);

    const findList = () => {
        setList(null);
        ipcRenderer.send('sonarqube.findList');
        ipcRenderer.removeAllListeners('sonarqube.findListCallback');
        ipcRenderer.on('sonarqube.findListCallback', async (event, data) => {
            setList(data);
            setLastUpdated(UiShare.getCurrDate() + " " + UiShare.getCurrTime());
        });
    }

    const findModuleList = () => {
        ipcRenderer.send('sonarqube.findModuleList');
        ipcRenderer.removeAllListeners('sonarqube.findModuleList');
        ipcRenderer.on('sonarqube.findModuleListCallback', (event, data) => {
            const components = data.data.components;
            const availableModules = data.availableModules;
            const filteredComponents = filterComponents(components);
            const checkedModuleNames = availableModules.map(module => module.name);
            setCheckedModuleNameList(checkedModuleNames);
            setComponentList(filteredComponents);
        });
    }

    const filterComponents = (components) => {
        return components.filter(component => {
            if (component.name.startsWith('core-asset-')) {
                return component;
            } else if (component.name.startsWith('talk-api-')) {
                return component;
            } else if (component.name.startsWith('talk-ui-')) {
                return component;
            } else {
                return null;
            }
        });
    }

    const onChangeUseAlarm = (event, data) => {
        const { checked } = data;
        setUseAlarmOnError(checked);
        ipcRenderer.send('sonarqube.useAlarmOnError', checked);
    }

    const onChangeModuleChange = (event, data) => {
        const name = data.name;
        const key = data.value; // key
        const checked = data.checked;

        if (checked) {
            ipcRenderer.send('sonarqube.addAvailableModule', {name, key});
            const newModules = [...checkedModuleNameList, name];
            setCheckedModuleNameList(newModules);
        } else {
            ipcRenderer.send('sonarqube.removeAvailableModule', {name, key});
            const newModules = checkedModuleNameList.filter(item => item !== name);
            setCheckedModuleNameList(newModules);
        }

        findList();
    }

    const findUseAlarmOnError = () => {
        ipcRenderer.send('sonarqube.findUseAlarmOnError');
        ipcRenderer.on('sonarqube.findUseAlarmOnErrorCallback', (event, data) => {
            setUseAlarmOnError(data);
            ipcRenderer.removeAllListeners('sonarqube.findUseAlarmOnErrorCallback');
        });
    }

    const setQualityErrorMessage = msg => {
        qualityErrorMessage = msg;
    }

    const onClickRefresh = () => {
        findList();
    }

    return (
        <Card fluid>
            <Card.Content>
                <Card.Header>
                    <TitleLayer title="Sonarqube" icon={sonarqubeIcon} />
                    <RightMenu
                        findList={findList}
                        componentList={componentList}
                        checkedModuleNameList={checkedModuleNameList}
                        onChangeModuleChange={onChangeModuleChange}
                        setUseAlarmOnError={setUseAlarmOnError}
                        useAlarmOnError={useAlarmOnError}
                        onClickRefresh={onClickRefresh}
                        onChangeUseAlarm={onChangeUseAlarm}
                    />
                </Card.Header>
                <ContentLayer
                    setQualityErrorMessage={setQualityErrorMessage}
                    lastUpdated={lastUpdated}
                    list={list}
                />
            </Card.Content>
            <Card.Content extra>
                <AddLinkLayer href="http://211.63.24.41:9000/projects?sort=-analysis_date" />
            </Card.Content>
        </Card>
    )
};

export default Sonarqube;
