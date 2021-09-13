import React, {useState, useEffect, useContext} from 'react';
import outlookIcon from '../static/image/outlook.png';
import {Card, Icon, Dropdown, List, Tab, Button, Segment, Header, Label, Menu} from 'semantic-ui-react'
import UiShare  from '../UiShare';
import {clearIntervalAsync, setIntervalAsync} from "set-interval-async/dynamic";
import TimerContext from "../TimerContext";
const { ipcRenderer } = window.require('electron');

function Outlook() {
    const [list, setList] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const tickTime = useContext(TimerContext);

    useEffect(() => {
        findList();
    }, []);

    useEffect(() => {
        if (tickTime == null) return;
        if (!authenticated) return;
        const { minute } = UiShare.getTimeFormat(tickTime);
        if (minute%10 === 0) {
            findList();
        }
    }, [tickTime, authenticated]);

    const findList = () => {
        setList(null);
        ipcRenderer.send('outlook.findList');
        ipcRenderer.removeAllListeners('outlook.findListCallback');
        ipcRenderer.on('outlook.findListCallback', async (e, data) => {
            setList(data);
            setUnreadCount(data.unreadCount);
        });

        ipcRenderer.removeAllListeners('outlook.authenticated');
        ipcRenderer.on('outlook.authenticated', async (e, data) => {
            setAuthenticated(data);
        });
    }

    const rightBtnTrigger = (
        <span>
            <Icon name='user' />
        </span>
    )

    const displayListLayer = () => {
        if (authenticated) {
            return (
                <div className="list-layer">
                    <Tab panes={[
                        { menuItem: '받은 편지함', render: () =>
                                <Tab.Pane>
                                    <List divided relaxed>
                                        {displayListItem()}
                                    </List>
                                </Tab.Pane>}
                    ]} />
                </div>
            )
        } else {
            return <Segment placeholder>
                <Header icon>
                    <img src={outlookIcon} alt="" className="component-icon"/>
                    Outlook에 로그인
                </Header>
                <Button primary onClick={onClickLogin}>Login</Button>
            </Segment>;
        }
    }

    const displayListItem = () => {
        if (list == null) {
            return UiShare.displayListLoading();
        } else {
            return list.conversations.map(item => {
                const { ConversationId, UniqueSenders, ConversationTopic, LastDeliveryTime, UnreadCount } = item;
                const id = ConversationId.Id;
                let lastDeliveryTime = LastDeliveryTime;

                lastDeliveryTime = lastDeliveryTime.replace(/T/, ' ');
                lastDeliveryTime = lastDeliveryTime.substring(0, 16);

                let readFlagStyle = '';
                if (UnreadCount === 0) {
                    readFlagStyle = 'normal';
                }

                return <List.Item key={id}>
                    <List.Content>
                        <List.Header>
                            <a rel="noreferrer" target="_blank" onClick={openOutlook} style={{fontWeight:readFlagStyle}}>{ConversationTopic}</a>
                        </List.Header>
                        <List.Description>{UniqueSenders} | {lastDeliveryTime}</List.Description>
                    </List.Content>
                </List.Item>;
            });
        }
    }

    const displayRightMenu = () => {
        if (authenticated) {
            return <div className="btn-right-layer">
                <Icon name='expand arrows alternate' className='component-move'/>
                <Icon name='refresh' onClick={onClickRefresh}/>
                <Menu.Item as='a' style={{position:'relative', cursor:'pointer'}} onClick={openOutlook}>
                    <Icon name='bell' style={{color:'#000'}}/>
                    <Label color='red' floating style={{display:unreadCount>0?"":"none", borderRadius:'16px', fontSize: '10px', padding: '4px'}}>
                        {unreadCount}
                    </Label>
                </Menu.Item>
                <Dropdown trigger={rightBtnTrigger} options={[
                    { key: 'logout', text: 'Logout', onClick: onClickLogout }
                ]} />
            </div>;
        }
    }

    const onClickRefresh = () => {
        findList();
    }

    const onClickLogin = () => {
        ipcRenderer.send('outlook.openLoginPage');
    }

    const onClickLogout = () => {
        ipcRenderer.send('outlook.logout');
    }

    const openOutlook = () => {
        ipcRenderer.send('outlook.openOutlook');
    }

    return (
        <Card fluid>
            <Card.Content>
                <Card.Header>
                    <div className="ui header">
                        <img src={outlookIcon} alt="" className="header-icon"/>
                        outlook
                    </div>
                    {displayRightMenu()}
                </Card.Header>

                {displayListLayer()}

            </Card.Content>
            <Card.Content extra>
                <Button fluid color="blue" onClick={openOutlook}>
                    Outlook 열기
                </Button>
            </Card.Content>
        </Card>
    )
};

export default Outlook;
