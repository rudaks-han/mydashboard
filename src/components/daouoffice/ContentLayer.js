import React from 'react';
import {Button, Header, Segment, Tab} from 'semantic-ui-react';
import CompanyBoardList from "./CompanyBoardList";
import CompanyDayoffList from "./CompanyDayoffList";
import MyDayoffList from "./MyDayoffList";

function ContentLayer(props) {
    if (props.authenticated) {
        return (
            <div className="list-layer">
                <Tab panes={[
                    {
                        menuItem: '전사 게시판', render: () =>
                            <Tab.Pane>
                                <CompanyBoardList list={props.list}/>
                            </Tab.Pane>
                    },
                    {
                        menuItem: '회사 연차현황', render: () =>
                            <Tab.Pane>
                                <CompanyDayoffList dayoffList={props.dayoffList} />
                            </Tab.Pane>
                    },
                    {
                        menuItem: '내 연차', render: () =>
                            <Tab.Pane>
                                <MyDayoffList myDayoffList={props.myDayoffList} />
                            </Tab.Pane>
                    }
                ]} />
            </div>
        )
    } else {
        return <Segment placeholder>
            <Header icon>
                <img src={props.daouofficeIcon} alt="" className="component-icon"/>
                Daouoffice에 로그인
            </Header>
            <Button primary onClick={props.onClickLogin}>Login</Button>
        </Segment>;
    }
};

export default ContentLayer;
