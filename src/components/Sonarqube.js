import React, { useState, useEffect } from 'react';
import sonarqubeIcon from '../static/image/sonarqube-logo.png';
import { Card, Icon, List, Button, Label, Statistic } from 'semantic-ui-react'
import UiShare  from '../UiShare';
import ModuleList from "./sonarqube/ModuleList";
import {clearIntervalAsync, setIntervalAsync} from "set-interval-async/dynamic";
const { ipcRenderer } = window.require('electron');

function Sonarqube() {
    const [list, setList] = useState(null);
    const [clickedSetting, setClickSetting] = useState(false);

    useEffect(() => {
        findList();
    }, []);

    useEffect(() => {
        const timer = setIntervalAsync(
            async () => {
                console.log('[sonarqube] scheduler ==> findList ' + UiShare.getCurrTime())
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
        ipcRenderer.send('sonarqube.findList');
        ipcRenderer.removeAllListeners('sonarqube.findListCallback');
        ipcRenderer.on('sonarqube.findListCallback', async (e, data) => {
            setList(data);
        });
    }

    const displayListLayer = () => {
        return (
            <div className="list-layer">
                <List divided style={{'height': '320px'}}>
                    {displayListItem()}
                </List>
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
                            securityHotspotsColor = 'red';
                            securityHotspotsMarkStyle = {verticalAlign: 'top'};
                        }
                    } else if (measure.metric === 'new_vulnerabilities') {
                        vulnerabilitiesBestValue = bestValue;
                        vulnerabilitiesValue = value;
                        vulnerabilitiesLink = `http://211.63.24.41:9000/project/issues?id=${moduleName}&resolved=false&sinceLeakPeriod=true&types=VULNERABILITY`;
                        if (!vulnerabilitiesBestValue) {
                            hasModuleError = true;
                            vulnerabilitiesColor = 'red';
                            vulnerabilitiesMarkStyle = {verticalAlign: 'top'};
                        }
                    } else if (measure.metric === 'new_code_smells') {
                        codeSmellBestValue = bestValue;
                        codeSmellValue = value;
                        codeSmellLink = `http://211.63.24.41:9000/project/issues?id=${moduleName}&resolved=false&sinceLeakPeriod=true&types=CODE_SMELL`
                        if (!codeSmellBestValue) {
                            hasModuleError = true;
                            codeSmellColor = 'red';
                            codeSmellMarkStyle = {verticalAlign: 'top'}
                        }
                    } else if (measure.metric === 'new_bugs') {
                        bugsBestValue = bestValue;
                        bugsValue = value;
                        bugsLink = `http://211.63.24.41:9000/project/issues?id=${moduleName}&resolved=false&sinceLeakPeriod=true&types=BUG`;
                        if (!bugsBestValue) {
                            hasModuleError = true;
                            bugsColor = 'red';
                            bugsMarkStyle = {verticalAlign: 'top'};
                        }
                    } else {
                        console.log(`"${measure.metric}" is not defined.`)
                    }
                });

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
                <ModuleList findList={findList}/>
            </div>;
        }
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
