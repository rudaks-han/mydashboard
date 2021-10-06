import firebase from 'firebase/app';
import database from 'firebase/database';
import UiShare from './UiShare';

class FirebaseApp {
    constructor() {
        const firebaseConfig = {
            apiKey: "AIzaSyBstwO5lsvzNsPsJouytngc5jdzN7sx0xo",
            authDomain: "my-dashboard-52109.firebaseapp.com",
            databaseURL: "https://my-dashboard-52109-default-rtdb.asia-southeast1.firebasedatabase.app",
            projectId: "my-dashboard-52109",
            storageBucket: "my-dashboard-52109.appspot.com",
            messagingSenderId: "137151026794",
            appId: "1:137151026794:web:eee549a4a9a39b81fc5c13",
            measurementId: "G-0YZB38B6HK"
        };
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        this.database = firebase.database();
        this.activeUsersPath = '/active_users';
        this.accessLogPath = '/access_logs';
    }

    updateActiveUserStatus(data) {
        const {id, employeeNumber, name, position, deptName} = data;
        const userStatusDatabaseRef = this.database.ref(this.activeUsersPath + '/' + name);
        const currTime = UiShare.getCurrDate() + " " + UiShare.getCurrTime();
        const { ip } = UiShare.getClientIp()
        const isOfflineForDatabase = {
            name,
            id,
            employeeNumber,
            position,
            deptName,
            ip,
            state: 'offline',
            last_changed: currTime,
        };

        const isOnlineForDatabase = {
            name,
            id,
            employeeNumber,
            position,
            deptName,
            ip,
            state: 'online',
            last_changed: currTime,
        };

        this.database.ref('.info/connected').on('value', function(snapshot) {
            if (snapshot.val() === false) {
                return;
            };
            userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function() {
                userStatusDatabaseRef.set(isOnlineForDatabase);
            });
        });

        const activeUsersRef = this.database.ref(this.activeUsersPath);
        activeUsersRef.on('child_changed', function(snapshot) {
        });
    }

    addAccessLog(name) {
        const currYear = UiShare.getCurrYear();
        const currMonth = UiShare.getCurrMonth();
        const currDay = UiShare.getCurrDay();
        //const currDate = UiShare.getCurrDate();
        const currTime = UiShare.getCurrTime();
        const { ip } = UiShare.getClientIp()

        const ref = this.database.ref(this.accessLogPath + '/' + currYear + '-' + currMonth + '/' + currDay + '/' + currTime + '_' + name);
        ref.set(ip).then(function() {
            //userStatusDatabaseRef.set(isOnlineForDatabase);
        });
    }
}

export default FirebaseApp;
