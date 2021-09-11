import React, { useState, useEffect } from 'react';
import victoryPortalIcon from '../static/image/victory-portal.ico';
import { Card, Icon, List, Tab, Button } from 'semantic-ui-react'
import UiShare  from '../UiShare';
import {clearIntervalAsync, setIntervalAsync} from "set-interval-async/dynamic";
const { ipcRenderer } = window.require('electron');

function VictoryPortal() {
    const [list, setList] = useState(null);

    useEffect(() => {
        findList();
    }, []);

    useEffect(() => {
        const timer = setIntervalAsync(
            async () => {
                console.log('[victoryPortal] scheduler ==> findList ' + UiShare.getCurrTime())
                findList();
            }, 1000 * 60 * 10
        );

        return () => {
            (async () => {
                if (timer) {
                    await clearIntervalAsync(timer);
                }
            })();
        };
    }, [])

    const findList = () => {
        setList(null);
        ipcRenderer.send('victoryPortal.findList');
        ipcRenderer.removeAllListeners('victoryPortal.findListCallback');
        ipcRenderer.on('victoryPortal.findListCallback', async (e, data) => {
            setList(data);
        });
    }

    const displayListLayer = () => {
        return (
            <div className="list-layer">
                <Tab panes={[
                    { menuItem: '최근 글', render: () =>
                            <Tab.Pane>
                                <List divided relaxed>
                                    {displayListItem()}
                                </List>
                            </Tab.Pane>}
                ]} />
            </div>
        );
    }

    const displayListItem = () => {
        if (list == null) {
            return UiShare.displayListLoading();
        } else {
            return list.map(item => {
                const { id, date, link, title } = item;

                return <List.Item key={id}>
                    <List.Content>
                        <List.Header>
                            <a href={link} rel="noreferrer" target="_blank">{title.rendered}</a>
                        </List.Header>
                        <List.Description>{date.substring(0, 10)}</List.Description>
                    </List.Content>
                </List.Item>;
            });
        }
    }

    const displayRightMenu = () => {
        return <div className="btn-right-layer">
            <Icon name='expand arrows alternate' className='component-move'/>
            <Icon name='refresh' onClick={onClickRefresh}/>
        </div>;
    }

    const onClickRefresh = () => {
        findList();
    }

    return (
        <Card fluid>
            <Card.Content>
                <Card.Header>
                    <div className="ui header">
                        <img src={victoryPortalIcon} alt="" className="header-icon"/>
                        VictoryPortal
                    </div>
                    {displayRightMenu()}
                </Card.Header>

                {displayListLayer()}

            </Card.Content>
            <Card.Content extra>
                <Button fluid color="blue" as='a' href={'https://victory-portal.spectra.co.kr/'} rel="noreferrer" target='_blank'>
                    바로 가기
                </Button>
            </Card.Content>
        </Card>
    )
};

export default VictoryPortal;
