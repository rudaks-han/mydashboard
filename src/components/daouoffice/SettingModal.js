import React from 'react';
import {Icon, Header, Modal, Form, Checkbox, Select, Dropdown} from 'semantic-ui-react';
import {Button} from 'semantic-ui-react'
import DropdownTime from "./DropdownTime";
const { ipcRenderer } = window.require('electron');

const SettingModal = props => {
    const [open, setOpen] = React.useState(false)

    const getUseAlarmClock = () => {
        return {
            clockIn: props.useAlarmClock.clockIn,
            clockOut: props.useAlarmClock.clockOut,
            beforeTime: props.useAlarmClock.beforeTime,
            afterTime: props.useAlarmClock.afterTime
        }
    }

    const onCheckUseClockInTime = (e, data) => {
        const param = {
            ...getUseAlarmClock(),
            clockIn: data.checked
        }

        console.log(param);

        props.setUseAlarmClock(param);
        ipcRenderer.send('daouoffice.setUseAlarmClock', param);
    }

    const onCheckUseClockOutTime = (e,data) => {
        const param = {
            ...getUseAlarmClock(),
            clockOut: data.checked
        }

        props.setUseAlarmClock(param);
        ipcRenderer.send('daouoffice.setUseAlarmClock', param);
    }

    const onChangeClockInBeforeTime = (e, data) => {

        const param = {
            ...getUseAlarmClock(),
            beforeTime: data.value
        }
        console.log(param);
        props.setUseAlarmClock(param);
        ipcRenderer.send('daouoffice.setUseAlarmClock', param);
    }

    const onChangeClockOutAfterTime = (e, data) => {

        const param = {
            ...getUseAlarmClock(),
            afterTime: data.value
        }
        console.log(param);
        props.setUseAlarmClock(param);
        ipcRenderer.send('daouoffice.setUseAlarmClock', param);
    }

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
                        <div role="listbox" className='ui active visible dropdown'>
                            <Checkbox label='사용' checked={props.useAlarmClock.clockIn} onChange={onCheckUseClockInTime} />,
                            &nbsp;
                            <DropdownTime
                                count={15}
                                onChange={onChangeClockInBeforeTime}
                                value={props.useAlarmClock.beforeTime}
                            /> 전 알림
                        </div>
                    </Form.Field>
                    <Form.Field>
                        <label>퇴근 시간 체크 알림 (퇴근 시간: {props.userInfo.workEndTime})</label>
                        <div role="listbox" className='ui active visible dropdown'>
                            <Checkbox label='사용' checked={props.useAlarmClock.clockOut} onChange={onCheckUseClockOutTime} />
                            &nbsp;
                            <DropdownTime
                                count={15}
                                onChange={onChangeClockOutAfterTime}
                                value={props.useAlarmClock.afterTime}
                            /> 후 알림
                        </div>
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
