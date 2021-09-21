import React from 'react';
import {Icon, Header, Modal, Form, Checkbox} from 'semantic-ui-react';
import {Button} from 'semantic-ui-react'
const { ipcRenderer } = window.require('electron');

const SettingModal = props => {
    const [open, setOpen] = React.useState(false)

    const onCheckUseClockInTime = (e, data) => {
        const param = {
            clockIn: data.checked,
            clockOut: props.useAlarmClock.clockOut
        }

        props.setUseAlarmClock(param);
        ipcRenderer.send('daouoffice.setUseAlarmClock', param);
    }

    const onCheckUseClockOutTime = (e,data) => {
        const param = {
            clockIn: props.useAlarmClock.clockIn,
            clockOut: data.checked
        }

        props.setUseAlarmClock(param);
        ipcRenderer.send('daouoffice.setUseAlarmClock', param);
    }

    console.log(props.useAlarmClock.clockIn)
    return (
        <Modal
            closeIcon
            open={open}
            trigger={<Icon name='setting' />}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
        >
            <Header icon='setting' content='Daouoffice Settings' />
            <Modal.Content>
                <Form>
                    <Form.Field>
                        <label>출근 시간 체크 알림 (출근 시간: {props.userInfo.workStartTime})</label>
                        <Checkbox label='사용' checked={props.useAlarmClock.clockIn} onChange={onCheckUseClockInTime} /> (5분 전)
                    </Form.Field>
                    <Form.Field>
                        <label>퇴근 시간 체크 알림 (퇴근 시간: {props.userInfo.workEndTime})</label>
                        <Checkbox label='사용' checked={props.useAlarmClock.clockOut} onChange={onCheckUseClockOutTime} /> (5분 전)
                    </Form.Field>
                </Form>

                {/*<div>
                    <div className="ui checkbox">
                        <input type="checkbox" checked={props.useAlarmClock.clockIn} onChange={onCheckUseClockInTime} />
                        <label>출근 시간(<span>{props.userInfo.workStartTime}</span>) 체크 알림 (5분 전)</label>
                    </div>
                    <div className="ui checkbox">
                        <input type="checkbox" checked={props.useAlarmClock.clockOut} onChange={onCheckUseClockOutTime} />
                        <label>퇴근 시간(<span>{props.userInfo.workEndTime}</span>) 체크 알림 (정시)</label>
                    </div>
                </div>*/}
            </Modal.Content>
            <Modal.Actions>
                <Button color='green' onClick={() => setOpen(false)}>
                    <Icon name='checkmark' /> Close
                </Button>
            </Modal.Actions>
        </Modal>
    )

};

export default SettingModal;
