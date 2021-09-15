import React from 'react';
import {Button, Dropdown, Popup} from 'semantic-ui-react'

function ExtraButtons({ authenticated, userInfo, onClockIn, onClockOut }) {
    if (authenticated && userInfo) {
        return <div style={{"marginBottom":"5px"}}>
            <Button.Group>
                <Popup
                    content={userInfo.clockInTime}
                    open={!!userInfo.clockedIn}
                    trigger={<Button onClick={onClockIn} disabled={!!userInfo.clockedIn}>출근하기</Button>}
                />
                <Button.Or />
                <Popup
                    content={userInfo.clockOutTime}
                    open={!!userInfo.clockedOut}
                    trigger={<Button onClick={onClockOut} positive disabled={!!userInfo.clockedOut}>퇴근하기</Button>}
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
