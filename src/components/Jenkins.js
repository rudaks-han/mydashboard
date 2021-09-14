import React, {useState, useEffect, useContext} from 'react';
import jenkinsIcon from '../static/image/jenkins.png';
import {Card, Icon, List, Button, Label, Checkbox, Form, Segment, Header, Dropdown} from 'semantic-ui-react'
import UiShare  from '../UiShare';
import TimerContext from "../TimerContext";
const { ipcRenderer } = window.require('electron');

function Jenkins() {
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
        const { hour, minute } = UiShare.getTimeFormat(tickTime);
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
        ipcRenderer.on('jenkins.findModuleListCallback', (e, data) => {
            const jobs = data.data;
            const availableModules = data.availableModules;
            const filteredJobs = filterJobs(jobs);
            const checkedModuleNames = availableModules.map(module => module.name);
            setCheckedModuleNameList(checkedModuleNames);
            setJobList(filteredJobs);
            ipcRenderer.removeAllListeners('jenkins.findModuleListCallback');
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
        ipcRenderer.on('jenkins.findListCallback', (e, data) => {
            ipcRenderer.removeAllListeners('jenkins.findListCallback');
            setList(data);
            setLastUpdated(UiShare.getCurrDate() + " " + UiShare.getCurrTime());
        });

        ipcRenderer.removeAllListeners('jenkins.authenticated');
        ipcRenderer.on('jenkins.authenticated', async (e, data) => {
            setAuthenticated(data);
        });
    }

    const displayListLayer = () => {
        if (authenticated) {
            return (
                <div>
                    <div style={{textAlign:'right'}}>
                        <Label>last Updated: {lastUpdated}</Label>
                    </div>
                    <div className="list-layer">
                        <List divided relaxed size='huge' style={{'height': '320px'}}>
                            {displayListItem()}
                        </List>
                    </div>
                </div>
            );
        } else {
            return <Segment placeholder>
                <Header icon>
                    <img src={jenkinsIcon} alt="" className="component-icon"/>
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

            buildErrorMessage = errorMessage;

            return result;
        }
    }

    const toDate = (timestamp) => {
        return UiShare.timeSince(timestamp) + ' ago';
    }

    const rightBtnTrigger = (
        <span>
            <Icon name='user' />
        </span>
    )

    const displayRightMenu = () => {
        if (authenticated) {
            return <div className="btn-right-layer">
                <Icon name='expand arrows alternate' className='component-move'/>
                <Icon name='refresh' onClick={onClickRefresh}/>
                <Icon name='setting' onClick={onClickSetting}/>
                {displaySettingLayer()}
                <Dropdown trigger={rightBtnTrigger} options={[
                    { key: 'logout', text: 'Logout', onClick: onClickLogout }
                ]} />
            </div>;
        }
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
                        {displayModuleList()}
                    </Form.Field>
                </Form>
            </div>;
        }
    }

    const onChangeUseAlarm = (e, data) => {
        const { checked } = data;
        setUseAlarmOnError(checked);
        ipcRenderer.send('jenkins.useAlarmOnError', checked);
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
