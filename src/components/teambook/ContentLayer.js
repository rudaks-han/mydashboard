import React from 'react';
import {Tab} from 'semantic-ui-react';
import BookList from "./BookList";
import AddLinkLayer from "../share/AddLinkLayer";

const ContentLayer = props => {
    return (
        <div className="list-layer">
            <Tab panes={[
                {
                    menuItem: '개발팀', render: () =>
                        <Tab.Pane>
                            <BookList list={props.devBookList} />
                            <AddLinkLayer href="https://docs.google.com/spreadsheets/d/1DVwEPdy7Z685aYGU68Ierf8G6a39jEzzZLAoojkRydI" />
                        </Tab.Pane>
                },
                {
                    menuItem: '연구소', render: () =>
                        <Tab.Pane>
                            <BookList list={props.rndBookList} />
                            <AddLinkLayer href="https://docs.google.com/spreadsheets/d/1298EutL5c7NMEC-DkEDsy9MDV53nCPA93dJqUcQns9A" />
                        </Tab.Pane>
                }
                ]}
            />
        </div>
    )
};

export default ContentLayer;
