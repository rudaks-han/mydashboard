import React from 'react';
import {Checkbox, Form, Icon} from 'semantic-ui-react';
import ModuleList from "./ModuleList";

const RightMenu = props => {
    const onChangeUseAlarm = (e, data) => {
        const { checked } = data;
        props.setUseAlarmOnError(checked);
        ipcRenderer.send('sonarqube.useAlarmOnError', checked);
    }

    const displaySettingLayer = () => {
        if (props.clickedSetting) {
            return <div className="setting-layer">
                <Form>
                    <Form.Field>
                        <label>알림 여부</label>
                        <Checkbox checked={props.useAlarmOnError} onChange={onChangeUseAlarm}/> 오류 발생 시 화면 알림 (10시, 15시)
                    </Form.Field>
                    <Form.Field>
                        <label>사용 모듈</label>
                        <ModuleList findList={props.findList}/>
                    </Form.Field>
                </Form>
            </div>;
        }
    }

    return (
        <div className="btn-right-layer">
            <Icon name='expand arrows alternate' className='component-move'/>
            <Icon name='refresh' onClick={props.onClickRefresh}/>
            <Icon name='setting' onClick={props.onClickSetting}/>
            {displaySettingLayer()}
        </div>
    )
};

export default RightMenu;
