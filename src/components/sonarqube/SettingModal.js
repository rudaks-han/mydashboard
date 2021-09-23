import React from 'react';
import {Button, Checkbox, Form, Header, Icon, Modal} from 'semantic-ui-react';

const SettingModal = props => {
    const [open, setOpen] = React.useState(false)

    const displayModuleList = () => {
        if (props.componentList == null) return null;
        return props.componentList.map(item => {
            return <div key={item.key}>
                <Checkbox label={item.name} value={item.key} name={item.name} checked={props.checkedModuleNameList.includes(item.name)} onChange={props.onChangeModuleChange} />
            </div>
        })
    }

    return (
        <Modal
            closeIcon
            open={open}
            trigger={<Icon name='setting' />}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
        >
            <Header icon='setting' content='Sonarqube Settings' />
            <Modal.Content>
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
