import React, {useState, useEffect, useContext} from 'react';
import jenkinsIcon from '../static/image/jenkins.png';
import { Card, Icon, List, Button, Label, Checkbox } from 'semantic-ui-react'
import UiShare  from '../UiShare';
import {clearIntervalAsync, setIntervalAsync} from "set-interval-async/dynamic";
import TimerContext from "../TimerContext";
const { ipcRenderer } = window.require('electron');

function Jenkins() {
    const [list, setList] = useState(null);
    const [checkedModuleNameList, setCheckedModuleNameList] = useState([]);
    const [jobList, setJobList] = useState([]);
    const [clickedSetting, setClickSetting] = useState(false);
    const tickTime = useContext(TimerContext);

    useEffect(() => {
        findList();
        findModuleList();
    }, []);

    useEffect(() => {
        if (tickTime == null) return;
        const { minute } = UiShare.getTimeFormat(tickTime);
        if (minute === 0) {
            console.log('[jenkins] scheduler ==> findList ' + UiShare.getCurrTime())
            findList();
        }
    }, [tickTime]);

    /*useEffect(() => {
        const timer = setIntervalAsync(
            async () => {
                console.log('[jenkins] scheduler ==> findList ' + UiShare.getCurrTime())
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
    }, [])*/

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
        ipcRenderer.removeAllListeners('jenkins.findListCallback');
        ipcRenderer.send('jenkins.findList');
        ipcRenderer.on('jenkins.findListCallback', (e, data) => {
            setList(data);
            ipcRenderer.removeAllListeners('jenkins.findListCallback');
        });
    }

    const displayListLayer = () => {
        return (
            <div className="list-layer">
                <List divided relaxed size='huge' style={{'height': '320px'}}>
                    {displayListItem()}
                </List>
            </div>
        );
    }

    const displayListItem = () => {
        if (list == null) {
            return UiShare.displayListLoading();
        } else {
            let hasError = false;
            let errorMessage = '';
            const result = list.map(item => {
                let lastBuildResult = false;
                let color = 'green';
                const moduleName = item.moduleName;
                if (item.result === 'SUCCESS') {
                    lastBuildResult = true;
                } else {
                    hasError = true;
                    color = 'red';
                    errorMessage += `${moduleName} failed \n`;
                }
                const freshness = item.timestamp > 0 ? toDate(item.timestamp) : '-';

                return <List.Item key={moduleName}>
                    <Label circular color={color} key={color} className='image padding20' style={{verticalAlign:'middle', fontSize: '20px'}}>
                        {lastBuildResult?'A':'E'}
                    </Label>

                    <List.Content>
                        <List.Header>
                            <a rel="noreferrer" href={`http://211.63.24.41:8080/view/victory/job/${moduleName}`} target='_blank'>{moduleName}</a>
                        </List.Header>
                        <List.Description>{freshness}</List.Description>
                    </List.Content>
                </List.Item>;
            });

            if (hasError) {
                /*UiShare.showNotification(`[My Dashboard] ${errorMessage}`);*/
            }

            return result;
        }
    }

    const toDate = (timestamp) => {
        return UiShare.timeSince(timestamp) + ' ago';
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
                {displayModuleList()}
            </div>;
        }
    }

    const displayModuleList = () => {
        return jobList.map(item => {
            return <div key={item.url}>
                <Checkbox label={item.name} value={item.branch} name={item.name} checked={checkedModuleNameList.includes(item.name)} onChange={onChangeModuleChange}/>
            </div>
        })
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

    return (
        <Card fluid>
            <Card.Content>
                <Card.Header>
                    <div className="ui header">
                        <img src={jenkinsIcon} alt="" className="header-icon"/>
                        Jenkins
                    </div>
                    {displayRightMenu()}
                </Card.Header>

                {displayListLayer()}

            </Card.Content>
            <Card.Content extra>
                <Button fluid color="blue" as='a' href={'http://211.63.24.41:8080/view/victory/'} rel="noreferrer" target='_blank'>
                    바로 가기
                </Button>
            </Card.Content>
        </Card>
    )
};

export default Jenkins;
