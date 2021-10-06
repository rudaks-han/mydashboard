import React, {useEffect, useState} from 'react';
import bookIcon from '../../static/image/book.png';
import {Card} from 'semantic-ui-react'
import RightMenu from "./RightMenu";
import TitleLayer from "../share/TitleLayer";
import ContentLayer from "./ContentLayer";

const { GoogleSpreadsheet } = require('google-spreadsheet');
const gsCredit = require('./dev-book-list-13a6535e9dd7.json');
const devDoc = new GoogleSpreadsheet('1DVwEPdy7Z685aYGU68Ierf8G6a39jEzzZLAoojkRydI'); // 개발팀
const rndDoc = new GoogleSpreadsheet('1298EutL5c7NMEC-DkEDsy9MDV53nCPA93dJqUcQns9A'); // 연구소

const TeamBook = () => {
    const [devBookList, setDevBookList] = useState(null);
    const [rndBookList, setRndBookList] = useState(null);

    useEffect(() => {
        findDevBookList();
        findRndBookList();
    }, []);

    const authGoogleSpreadsheet = async (doc) => {
        try {
            await doc.useServiceAccountAuth(gsCredit);
            await doc.loadInfo();
        } catch (error) {
            console.error('auth_error', error);
        }
    }

    const loadCells = async (doc) => {
        const sheet = doc.sheetsByIndex[0];
        const columnCount = sheet.columnCount;
        const rows = await sheet.getRows();
        const rowCount = rows.length;

        let rowList = [];
        await sheet.loadCells().then((response) => {
            for (let rowIndex=0; rowIndex<rowCount; rowIndex++) {
                let row = [];
                for (let colIndex = 0; colIndex<columnCount; colIndex++) {
                    const cell = sheet.getCell(rowIndex, colIndex);
                    row.push({
                        cell
                    })
                }

                rowList.push(row);
            }

            rowList.sort().reverse();
        });

        return rowList;
    }

    const findDevBookList = async () => {
        setDevBookList(null);
        await authGoogleSpreadsheet(devDoc);
        const rowData = await loadCells(devDoc);

        let bookList = [];
        rowData.map(row => {
            const index = row[0].cell._row; // 신청월
            const month = row[0].cell.formattedValue; // 신청월
            const date = row[1].cell._rawData.formattedValue; // 신청일
            const bookName = row[2].cell._rawData.formattedValue; // 도서명
            const username = row[3].cell._rawData.formattedValue; // 신청자
            const link = row[4].cell._rawData.formattedValue; // 링크
            if (month && month.indexOf('.') > -1) {
                bookList.push({ index, month, date, bookName, username, link})
            }
        });

        setDevBookList(bookList);
    }

    const findRndBookList = async () => {
        setRndBookList(null);
        await authGoogleSpreadsheet(rndDoc);
        const rowData = await loadCells(rndDoc);

        let bookList = [];
        rowData.map(row => {
            const index = row[0].cell._row;
            const date = row[0].cell._rawData.formattedValue; // 신청일
            const month = date ? date.substring(0, 7): date; // 신청월
            const username = row[1].cell._rawData.formattedValue; // 신청자
            const bookName = row[3].cell._rawData.formattedValue; // 도서명
            const link = row[7].cell._rawData.formattedValue; // 링크*/

            if (month && month.length === 7 && month.indexOf('.') > -1) {
                bookList.push({ index, month, date, bookName, username, link})
            }
        });

        setRndBookList(bookList);
    }

    const onClickRefresh = () => {
        findDevBookList();
        findRndBookList();
    }

    return (
        <Card fluid>
            <Card.Content>
                <Card.Header>
                    <TitleLayer title="개발도서 신청목록" icon={bookIcon} />
                    <RightMenu onClickRefresh={onClickRefresh}/>
                </Card.Header>
                <ContentLayer
                    devBookList={devBookList}
                    rndBookList={rndBookList}
                />
            </Card.Content>
        </Card>
    )
};

export default TeamBook;
