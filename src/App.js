import React, { useState, useEffect } from 'react';
import './App.css';
import {MainLayout} from "./layouts/MainLayout";
import UserContext from "./UserContext";
import FirebaseApp from './firebaseApp';

const { ipcRenderer } = window.require('electron');
const firebaseApp = new FirebaseApp();

function App() {
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    getUserInfo();
  }, []);


  const getUserInfo = () => {
    ipcRenderer.send('findStore', { key: 'userInfo'});
    ipcRenderer.on('findStoreCallback', (e, data) => {
      const {id, employeeNumber, name, position, deptName} = data;
      setUserInfo(data);
      firebaseApp.updateActiveUserStatus({id, employeeNumber, name, position, deptName});
      firebaseApp.addAccessLog(name);
      ipcRenderer.removeAllListeners('findStoreCallback');
    });

  }

  return (
      <UserContext.Provider value={userInfo}>
        <MainLayout />
      </UserContext.Provider>
  );
}

export default App;
