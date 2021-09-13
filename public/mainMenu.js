const { dialog } = require('electron');
const autoUpdater = require('./autoUpdater');

module.exports = [
    {
        label: 'MyDashboard',
        submenu: [
            {
                label: 'About My Dashboard'
            },
            {
                label: '업데이트 확인',
                click (item, focusedWindow) {
                    autoUpdater().checkUpdate();
                }
            },
            {
                type: 'separator'
            },
            {
                label: '초기화',
                click (item, focusWindow) {
                    dialog.showMessageBox({
                        type: 'info',
                        title: '정보 초기화',
                        message: '모든 정보를 초기화하겠습니까?',
                        buttons: ['예', '아니오']
                    }).then( result => {
                        let buttonIndex = result.response;
                        if (buttonIndex === 0) {
                            focusWindow.storeMap.clear();
                            focusWindow.load('https://spectra.daouoffice.com/login', false);
                        }
                    })
                }
            },

        ]
    },
    {
        label: 'Actions',
        submenu: [
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click (item, focusedWindow) {
                    if (focusedWindow) focusedWindow.reload()
                }
            },
            {
                label: 'Toggle Developer Tools',
                role: 'toggleDevTools'
            },
            {
                role: 'ToggleFullScreen'
            }
        ]
    }
]
