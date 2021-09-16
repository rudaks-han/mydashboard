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

function Sonarqube() {
    const [list, setList] = useState(null);
    const [useAlarmOnError, setUseAlarmOnError] = useState(false);
    const [clickedSetting, setClickSetting] = useState(false);
    const [lastUpdated, setLastUpdated] = useState('');
    const tickTime = useContext(TimerContext);
    let qualityErrorMessage;

    useEffect(() => {
        findList();
        findUseAlarmOnError();
    }, []);

    useEffect(() => {
        if (tickTime == null) return;
        const { hour, minute } = UiShare.getTimeFormat(tickTime);
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
        ipcRenderer.on('sonarqube.findListCallback', async (e, data) => {
            setList(data);
            setLastUpdated(UiShare.getCurrDate() + " " + UiShare.getCurrTime());
        });
    }

    const findUseAlarmOnError = () => {
        ipcRenderer.send('sonarqube.findUseAlarmOnError');
        ipcRenderer.on('sonarqube.findUseAlarmOnErrorCallback', (e, data) => {
            setUseAlarmOnError(data);
            ipcRenderer.removeAllListeners('sonarqube.findUseAlarmOnErrorCallback');
        });
    }

    const setQualityErrorMessage = msg => {
        qualityErrorMessage = msg;
    }

    const onClickSetting = e => {
        if (clickedSetting) {
            setClickSetting(false);
        } else {
            setClickSetting(true);
        }
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
                        setUseAlarmOnError={setUseAlarmOnError}
                        useAlarmOnError={useAlarmOnError}
                        clickedSetting={clickedSetting}
                        onClickRefresh={onClickRefresh}
                        onClickSetting={onClickSetting}
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
