import React, { useState, useEffect } from 'react';
import './App.css';
import {MainLayout} from "./layouts/MainLayout";
import UserContext from "./UserContext";
import FirebaseApp from './firebaseApp';
import UiShare from "./UiShare";
import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async/dynamic'
import TimerContext from "./TimerContext";

const { ipcRenderer } = window.require('electron');
const firebaseApp = new FirebaseApp();

function App() {
    const [userInfo, setUserInfo] = useState({});
    const [tickTime, setTickTime] = useState(null);

    useEffect(() => {
        getUserInfo();
    }, []);

    useEffect(() => {
        startTimer();
    }, []);

    const getUserInfo = () => {
        ipcRenderer.send('login.findUserInfo');
        ipcRenderer.on('login.findUserInfoCallback', async (e, data) => {
            const {id, employeeNumber, name, position, deptName} = data;
            setUserInfo(data);
            firebaseApp.updateActiveUserStatus({id, employeeNumber, name, position, deptName});
            firebaseApp.addAccessLog(name);

            return () => {
                ipcRenderer.removeAllListeners('findStoreCallback');
            }
        });

        ipcRenderer.on('login.authenticated', async (e, data) => {
            if (!data) {
                ipcRenderer.send('goLoginPage');
            }
        });
    }

    const startTimer = () => {
        const timer = setIntervalAsync(
            async () => {
                const time = UiShare.getCurrDate() + ' ' + UiShare.getCurrTime();
                setTickTime(time);
            },
            1000 * 60
            //1000 * 5
        );

        return () => {
            (async () => {
                if (timer) {
                await clearIntervalAsync(timer);
            }
        })();
        };
    }

    return (
        <UserContext.Provider value={userInfo}>
            <TimerContext.Provider value={tickTime}>
                <MainLayout />
            </TimerContext.Provider>
        </UserContext.Provider>
    );
}

export default App;
