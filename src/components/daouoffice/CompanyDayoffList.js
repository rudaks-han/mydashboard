import React from 'react';
import {List, Table} from 'semantic-ui-react'
import UiShare from '../../UiShare';

const CompanyBoardList = props => {
    const displayDayoffList = () => {
        if (props.dayoffList == null) {
            return (
                <Table.Row>
                    <Table.Cell>
                        {UiShare.displayListLoading()}
                    </Table.Cell>
                </Table.Row>
            );
        }

        return props.dayoffList.map(item => {
            const { id, startTimeDate, endTimeDate, summary } = item;

            let timeString = '';
            if (startTimeDate !== endTimeDate) {
                timeString = startTimeDate + '\n~' + endTimeDate;
            } else {
                timeString = startTimeDate;
            }
            return (
                <Table.Row key={id}>
                    <Table.Cell className='new-line' style={{minWidth: '105px'}}>{timeString}</Table.Cell>
                    <Table.Cell>{summary}</Table.Cell>
                </Table.Row>
            )
        });
    }

    return (
        <Table celled style={{display: 'block', height: '200px', overflowY: 'auto'}}>
            <Table.Body>
                {displayDayoffList()}
            </Table.Body>
        </Table>
    )
};

export default CompanyBoardList;
