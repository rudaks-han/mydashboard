const { dialog, shell } = require('electron');
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
    },
    {
        label: 'Daouoffice Link',
        submenu: [
            {
                label: '연차 신청서',
                click (item, focusedWindow) {
                    shell.openExternal('https://spectra.daouoffice.com/app/approval/document/new/2752/156184')
                }
            },
            {
                label: '비용 신청서',
                click (item, focusedWindow) {
                    shell.openExternal('https://spectra.daouoffice.com/app/approval/document/new/2752/168553')
                }
            },
            {
                type: 'separator'
            },
            {
                label: '시차출퇴근 근무 신청',
                click (item, focusedWindow) {
                    shell.openExternal('https://spectra.daouoffice.com/app/approval/document/new/2752/188949')
                }
            },
            {
                type: 'separator'
            },
            {
                label: '캘린더',
                click (item, focusedWindow) {
                    shell.openExternal('https://spectra.daouoffice.com/app/calendar')
                }
            },
            {
                label: '회의실 예약',
                click (item, focusedWindow) {
                    shell.openExternal('https://spectra.daouoffice.com/app/asset')
                }
            },
            {
                label: '전체 주소록',
                click (item, focusedWindow) {
                    shell.openExternal('https://spectra.daouoffice.com/app/contact/dept/2752')
                }
            },
            {
                type: 'separator'
            },
            {
                label: '근태관리',
                click (item, focusedWindow) {
                    shell.openExternal('https://spectra.daouoffice.com/app/ehr')
                }
            },
        ]
    }
]
