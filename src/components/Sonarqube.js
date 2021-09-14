import React, {useState, useEffect, useContext} from 'react';
import sonarqubeIcon from '../static/image/sonarqube-logo.png';
import {Card, Icon, List, Button, Label, Statistic, Form, Checkbox} from 'semantic-ui-react'
import UiShare  from '../UiShare';
import ModuleList from "./sonarqube/ModuleList";
import {clearIntervalAsync, setIntervalAsync} from "set-interval-async/dynamic";
import TimerContext from "../TimerContext";
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

    const displayListLayer = () => {
        return (
            <div>
                <div style={{textAlign:'right'}}>
                    <Label>last Updated: {lastUpdated}</Label>
                </div>
                <div className="list-layer">
                    <List divided style={{'height': '320px'}}>
                        {displayListItem()}
                    </List>
                </div>
            </div>
        );
    }

    const displayListItem = () => {
        if (list == null) {
            return UiShare.displayListLoading();
        } else {
            const labelStyle = {fontSize: '10px'}
            const result = list.map(item => {
                let hasModuleError = false;
                let errorMessage = '';
                const { moduleName, measures } = item;
                let codeSmellValue, codeSmellBestValue, codeSmellColor = 'green', codeSmellMarkStyle = {display: 'none'}, codeSmellLink;
                let vulnerabilitiesValue, vulnerabilitiesBestValue, vulnerabilitiesColor = 'green', vulnerabilitiesMarkStyle = {display: 'none'}, vulnerabilitiesLink;
                let bugsValue, bugsBestValue, bugsColor = 'green', bugsMarkStyle = {display: 'none'}, bugsLink;
                let securityHotspotsValue, securityHotspotsBestValue, securityHotspotsColor = 'green', securityHotspotsMarkStyle = {display: 'none'}, securityHotspotsLink;

                measures.map(measure => {
                    let bestValue = measure.periods[0]['bestValue'];
                    let value = measure.periods[0]['value'];
                    if (measure.metric === 'new_security_hotspots') {
                        securityHotspotsBestValue = bestValue;
                        securityHotspotsValue = value;
                        securityHotspotsLink = `http://211.63.24.41:9000/project/issues?id=${moduleName}&resolved=false&sinceLeakPeriod=true&types=SECURITY_HOTSPOT`;
                        if (!securityHotspotsBestValue) {
                            hasModuleError = true;
                            errorMessage += `${moduleName} securityHotspots failed \n`;
                            securityHotspotsColor = 'red';
                            securityHotspotsMarkStyle = {verticalAlign: 'top'};
                        }
                    } else if (measure.metric === 'new_vulnerabilities') {
                        vulnerabilitiesBestValue = bestValue;
                        vulnerabilitiesValue = value;
                        vulnerabilitiesLink = `http://211.63.24.41:9000/project/issues?id=${moduleName}&resolved=false&sinceLeakPeriod=true&types=VULNERABILITY`;
                        if (!vulnerabilitiesBestValue) {
                            hasModuleError = true;
                            errorMessage += `${moduleName} vulnerability failed \n`;
                            vulnerabilitiesColor = 'red';
                            vulnerabilitiesMarkStyle = {verticalAlign: 'top'};
                        }
                    } else if (measure.metric === 'new_code_smells') {
                        codeSmellBestValue = bestValue;
                        codeSmellValue = value;
                        codeSmellLink = `http://211.63.24.41:9000/project/issues?id=${moduleName}&resolved=false&sinceLeakPeriod=true&types=CODE_SMELL`
                        if (!codeSmellBestValue) {
                            hasModuleError = true;
                            errorMessage += `${moduleName} codesmell failed \n`;
                            codeSmellColor = 'red';
                            codeSmellMarkStyle = {verticalAlign: 'top'}
                        }
                    } else if (measure.metric === 'new_bugs') {
                        bugsBestValue = bestValue;
                        bugsValue = value;
                        bugsLink = `http://211.63.24.41:9000/project/issues?id=${moduleName}&resolved=false&sinceLeakPeriod=true&types=BUG`;
                        if (!bugsBestValue) {
                            hasModuleError = true;
                            errorMessage += `${moduleName} bugs failed \n`;
                            bugsColor = 'red';
                            bugsMarkStyle = {verticalAlign: 'top'};
                        }
                    } else {
                        console.log(`"${measure.metric}" is not defined.`)
                    }
                });

                qualityErrorMessage = errorMessage;

                const size = 'small'; // mini, tiny, small

                return (
                    <List.Item key={moduleName}>
                        <List.Content>
                            <List.Header style={{fontSize: '20px', paddingBottom:'20px', paddingTop: '10px'}}>{moduleName}</List.Header>
                            <List.Description>
                                <Statistic size={size}>
                                    <Statistic.Value>
                                        <a rel="noreferrer" href={bugsLink} target="_blank">{bugsValue}</a>
                                        <Label circular color={bugsColor} style={bugsMarkStyle}>
                                            {bugsBestValue ? 'A' : 'E'}
                                        </Label>
                                    </Statistic.Value>
                                    <Statistic.Label style={labelStyle}>Bugs</Statistic.Label>
                                </Statistic>
                                <Statistic size={size}>
                                    <Statistic.Value>
                                        <a rel="noreferrer" href={vulnerabilitiesLink} target="_blank">{vulnerabilitiesValue}</a>
                                        <Label circular color={vulnerabilitiesColor} style={vulnerabilitiesMarkStyle}>
                                            {vulnerabilitiesBestValue ? 'A' : 'E'}
                                        </Label>
                                    </Statistic.Value>
                                    <Statistic.Label style={labelStyle}>Vulnerabilities</Statistic.Label>
                                </Statistic>
                                <Statistic size={size}>
                                    <Statistic.Value>
                                        <a rel="noreferrer" href={codeSmellLink} target="_blank">{codeSmellValue}</a>
                                        <Label circular color={codeSmellColor} style={codeSmellMarkStyle}>
                                            {codeSmellBestValue ? 'A' : 'E'}
                                        </Label>
                                    </Statistic.Value>
                                    <Statistic.Label style={labelStyle}>Code Smells</Statistic.Label>
                                </Statistic>
                                <Statistic size={size}>
                                    <Statistic.Value>
                                        <a rel="noreferrer" href={securityHotspotsLink} target="_blank">{securityHotspotsValue}</a>
                                        <Label circular color={securityHotspotsColor} style={securityHotspotsMarkStyle}>
                                            {securityHotspotsBestValue ? 'A' : 'E'}
                                        </Label>
                                    </Statistic.Value>
                                    <Statistic.Label style={labelStyle}>Security Hotspots</Statistic.Label>
                                </Statistic>
                            </List.Description>
                        </List.Content>
                    </List.Item>
                )
            });

            return result;
        }
    }

    const displayRightMenu = () => {
        return <div className="btn-right-layer">
            <Icon name='expand arrows alternate' className='component-move'/>
            <Icon name='refresh' onClick={onClickRefresh}/>
            <Icon name='setting' onClick={onClickSetting}/>
            {displaySettingLayer()}
        </div>;
    }

    const onClickSetting = e => {
        if (clickedSetting) {
            setClickSetting(false);
        } else {
            setClickSetting(true);
        }
    }

    const displaySettingLayer = () => {
        if (clickedSetting) {
            return <div className="setting-layer">
                <Form>
                    <Form.Field>
                        <label>알림 여부</label>
                        <Checkbox checked={useAlarmOnError} onChange={onChangeUseAlarm}/> 오류 발생 시 화면 알림 (10시, 15시)
                    </Form.Field>
                    <Form.Field>
                        <label>사용 모듈</label>
                        <ModuleList findList={findList}/>
                    </Form.Field>
                </Form>
            </div>;
        }
    }

    const onChangeUseAlarm = (e, data) => {
        const { checked } = data;
        setUseAlarmOnError(checked);
        ipcRenderer.send('sonarqube.useAlarmOnError', checked);
    }

    const onClickRefresh = () => {
        findList();
    }

    return (
        <Card fluid>
            <Card.Content>
                <Card.Header>
                    <div className="ui header">
                        <img src={sonarqubeIcon} alt="" className="header-icon"/>
                        sonarqube
                    </div>
                    {displayRightMenu()}
                </Card.Header>

                {displayListLayer()}

            </Card.Content>
            <Card.Content extra>
                <Button fluid color="blue" as='a' href={'http://211.63.24.41:9000/projects?sort=-analysis_date'} rel="noreferrer" target='_blank'>
                    바로 가기
                </Button>
            </Card.Content>
        </Card>
    )
};

export default Sonarqube;
