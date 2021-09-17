import React from 'react';
import {Checkbox, Form} from 'semantic-ui-react';

const SettingLayer = props => {
    const displayModuleList = () => {
        return props.jobList.map(item => {
            return <div key={item.url}>
                <Checkbox label={item.name} value={item.branch} name={item.name} checked={props.checkedModuleNameList.includes(item.name)} onChange={props.onChangeModuleChange}/>
            </div>
        })
    }

    if (props.clickedSetting) {
        return (
            <div className="setting-layer">
                <Form>
                    <Form.Field>
                        <label>알림 여부</label>
                        <Checkbox checked={props.useAlarmOnError} onChange={props.onChangeUseAlarm}/> 오류 발생 시 화면 알림 (10시, 15시)
                    </Form.Field>
                    <Form.Field>
                        <label>사용 모듈</label>
                        {displayModuleList()}
                    </Form.Field>
                </Form>
            </div>
        )
    } else {
        return null;
    }
};

export default SettingLayer;
