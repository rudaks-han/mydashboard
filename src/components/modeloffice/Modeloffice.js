import React from 'react';
import {Card, CardDescription, Icon, List} from 'semantic-ui-react'
import TitleLayer from "../share/TitleLayer";

const Modeloffice = () => {
    const frontPageItems = [
        {name: 'backoffice', url: 'https://victory-backoffice.spectra.co.kr'},
        {name: 'customer', url: 'https://victory-customer.spectra.co.kr/demo'},
        {name: 'help center', url: 'https://victory-helpcenter.spectra.co.kr/customer'},
    ];

    const docsItems = [
        {name: 'Victory Documentation', url: 'http://172.16.100.49:8070/docs/index.html'},
        {name: 'Espresso API', url: 'http://172.16.100.49:8070/espresso/docs/index.html'},
        {name: 'Mocha API', url: 'http://172.16.100.49:8070/mocha/docs/index.html'},
        {name: 'Shop API', url: 'http://172.16.100.49:8070/shop/docs/index.html'},
        {name: 'Uaa API', url: 'http://172.16.100.49:8070/uaa/docs/index.html'},
        {name: 'Depot API', url: 'http://172.16.100.49:8070/depot/docs/index.html'},
        {name: 'Insight API', url: 'http://172.16.100.49:8070/insight/docs/index.html'},
        {name: 'Crema API', url: 'http://172.16.100.49:8070/crema/docs/index.html'},
        {name: 'Scheduler API', url: 'http://172.16.100.49:8070/scheduler/docs/index.html'},
    ];

    const displayLinkItems = (items) => {
        return (
            items.map(item => {
                return (
                    <List.Item key={item.name}>
                        <List.Icon name='linkify' />
                        <List.Content>
                            <List.Header>
                                <a className="header"
                                   href={item.url}
                                   rel="noreferrer"
                                   target="_blank">{item.name}</a>
                            </List.Header>
                        </List.Content>
                    </List.Item>
                )
            })
        )
    }

    const displayRightMenu = () => {
        return (
            <div className="btn-right-layer">
                <Icon name='expand arrows alternate' className='component-move'/>
            </div>
        );
    }

    return (
        <Card fluid>
            <Card.Content>
                <Card.Header>
                    <TitleLayer title="Victory Modeloffice" />
                    {displayRightMenu()}
                </Card.Header>
                <CardDescription>
                    <List style={{height: '380px', marginTop:'20px'}}>
                        <List.Item>
                            <List.Icon name='folder' />
                            <List.Content>
                                <List.Header>front page</List.Header>
                                <List.List>

                                    {displayLinkItems(frontPageItems)}

                                </List.List>
                            </List.Content>
                        </List.Item>

                        <List.Item>
                            <List.Icon name='folder' />
                            <List.Content>
                                <List.Header>victory docs</List.Header>
                                <List.List>

                                    {displayLinkItems(docsItems)}

                                </List.List>
                            </List.Content>
                        </List.Item>
                    </List>
                </CardDescription>
            </Card.Content>
        </Card>
    )
};

export default Modeloffice;
