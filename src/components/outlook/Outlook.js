import React, {useContext, useEffect, useState} from 'react';
import outlookIcon from '../../static/image/outlook.png';
import {Card} from 'semantic-ui-react'
import UiShare from '../../UiShare';
import TimerContext from "../../TimerContext";
import RightMenu from "./RightMenu";
import AddLinkLayer from "../share/AddLinkLayer";
import ContentLayer from "./ContentLayer";

const { ipcRenderer } = window.require('electron');

const Outlook = () => {
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
        const { minute } = UiShare.getDateTimeFormat(tickTime);
        if (minute%10 === 0) {
            findList();
        }
    }, [tickTime, authenticated]);

    const findList = () => {
        setList(null);
        ipcRenderer.send('outlook.findList');
        ipcRenderer.removeAllListeners('outlook.findListCallback');
        ipcRenderer.on('outlook.findListCallback', async (event, data) => {
            setList(data);
            setUnreadCount(data.unreadCount);
        });

        ipcRenderer.removeAllListeners('outlook.authenticated');
        ipcRenderer.on('outlook.authenticated', async (event, data) => {
            setAuthenticated(data);
        });
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
                        Outlook
                    </div>
                    <RightMenu
                        authenticated={authenticated}
                        onClickRefresh={onClickRefresh}
                        onClickLogout={onClickLogout}
                        openOutlook={openOutlook}
                        unreadCount={unreadCount}
                    />
                </Card.Header>
                <ContentLayer
                    authenticated={authenticated}
                    list={list}
                    title="Outlook"
                    icon={outlookIcon}
                    onClickLogin={onClickLogin}
                    openOutlook={openOutlook}
                />
            </Card.Content>
            <Card.Content extra>
                <AddLinkLayer onClick={openOutlook} text="Outlook ??????" />
            </Card.Content>
        </Card>
    )
};

export default Outlook;
