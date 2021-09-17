import React from 'react';
import {Button, Dropdown, Popup} from 'semantic-ui-react'

const ExtraButtons = props => {
    if (props.authenticated && props.userInfo) {
        return <div style={{"marginBottom":"5px"}}>
            <Button.Group>
                <Popup
                    content={props.userInfo.clockInTime}
                    open={!!props.userInfo.clockedIn}
                    trigger={<Button onClick={props.onClockIn} disabled={!!props.userInfo.clockedIn}>출근하기</Button>}
                />
                <Button.Or />
                <Popup
                    content={props.userInfo.clockOutTime}
                    open={!!props.userInfo.clockedOut}
                    trigger={<Button onClick={props.onClockOut} positive disabled={!!props.userInfo.clockedOut}>퇴근하기</Button>}
                />
            </Button.Group>
            &nbsp;
            <Button.Group>
                <Button>링크</Button>
                <Dropdown
                    className='button icon'
                    floating
                    options={[
                        { key: '1', icon: 'discussions', selected: true, text: '회의실 예약', href: 'https://spectra.daouoffice.com/app/asset', target: '_blank'},
                        { key: '2', icon: 'address book', selected: true, text: '주소록', href: 'https://spectra.daouoffice.com/app/contact/dept/2752', target: '_blank'},
                    ]}
                    trigger={<></>}
                />
            </Button.Group>
        </div>
    } else {
        return null;
    }
};

export default ExtraButtons;
