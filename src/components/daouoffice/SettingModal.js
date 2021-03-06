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

    const onCheckUseClockInTime = (event, data) => {
        const param = {
            ...getUseAlarmClock(),
            clockIn: data.checked
        }

        props.setUseAlarmClock(param);
        ipcRenderer.send('daouoffice.setUseAlarmClock', param);
    }

    const onCheckUseClockOutTime = (event,data) => {
        const param = {
            ...getUseAlarmClock(),
            clockOut: data.checked
        }

        props.setUseAlarmClock(param);
        ipcRenderer.send('daouoffice.setUseAlarmClock', param);
    }

    const onChangeClockInBeforeTime = (event, data) => {
        const param = {
            ...getUseAlarmClock(),
            beforeTime: data.value
        }

        props.setUseAlarmClock(param);
        ipcRenderer.send('daouoffice.setUseAlarmClock', param);
    }

    const onChangeClockOutAfterTime = (event, data) => {
        const param = {
            ...getUseAlarmClock(),
            afterTime: data.value
        }

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
                        <label>?????? ?????? ?????? ?????? (?????? ??????: {props.userInfo.workStartTime})</label>
                        <div role="listbox" className='ui active visible dropdown'>
                            <Checkbox label='??????' checked={props.useAlarmClock.clockIn} onChange={onCheckUseClockInTime} />
                            &nbsp;
                            <DropdownTime
                                from={1}
                                to={15}
                                onChange={onChangeClockInBeforeTime}
                                value={props.useAlarmClock.beforeTime}
                            /> ??? ??????
                        </div>
                    </Form.Field>
                    <Form.Field>
                        <label>?????? ?????? ?????? ?????? (?????? ??????: {props.userInfo.workEndTime})</label>
                        <div role="listbox" className='ui active visible dropdown'>
                            <Checkbox label='??????' checked={props.useAlarmClock.clockOut} onChange={onCheckUseClockOutTime} />
                            &nbsp;
                            <DropdownTime
                                from={0}
                                to={15}
                                onChange={onChangeClockOutAfterTime}
                                value={props.useAlarmClock.afterTime}
                            /> ??? ??????
                        </div>
                    </Form.Field>
                </Form>

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
