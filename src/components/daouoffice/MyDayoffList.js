import React from 'react';
import {Label, List, Statistic, Table} from 'semantic-ui-react'
import UiShare from '../../UiShare';

const MyDayoffList = props => {
    const displayMyDayoffList = () => {
        if (props.myDayoffList == null) {
            return (
                <Table.Row>
                    <Table.Cell>
                        {UiShare.displayListLoading()}
                    </Table.Cell>
                </Table.Row>
            );
        }

        const { startDate, endDate, sumPoint, usedPoint, restPoint } = props.myDayoffList;

        return (
            <div>
                <Label>
                    연차 사용기간
                    <Label.Detail>
                        {startDate} ~ {endDate}
                    </Label.Detail>
                </Label>
                <Statistic.Group size="mini">
                    <Statistic>
                        <Statistic.Value>{sumPoint}</Statistic.Value>
                        <Statistic.Label>총 연차</Statistic.Label>
                    </Statistic>
                    <Statistic>
                        <Statistic.Value>{usedPoint}</Statistic.Value>
                        <Statistic.Label>사용 연차</Statistic.Label>
                    </Statistic>
                    <Statistic color='red'>
                        <Statistic.Value>{restPoint}</Statistic.Value>
                        <Statistic.Label>잔여 연차</Statistic.Label>
                    </Statistic>
                </Statistic.Group>
            </div>
        );
    }

    return (
        <div style={{margin: '20px'}}>
            {displayMyDayoffList()}
        </div>
    )
};

export default MyDayoffList;
