import React from 'react';
import {Checkbox, Form} from 'semantic-ui-react';

function SettingLayer({jobList, useAlarmOnError, onChangeUseAlarm, checkedModuleNameList, onChangeModuleChange, clickedSetting }) {
    const displayModuleList = () => {
        return jobList.map(item => {
            return <div key={item.url}>
                <Checkbox label={item.name} value={item.branch} name={item.name} checked={checkedModuleNameList.includes(item.name)} onChange={onChangeModuleChange}/>
            </div>
        })
    }

    if (clickedSetting) {
        return (
            <div className="setting-layer">
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
            </div>
        )
    } else {
        return null;
    }
};

export default SettingLayer;
