const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');
autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.autoDownload = false;

module.exports = () => {
    console.log('Checking for updates: ' + process.env.mode);

    // ~/Library/Logs/my-dashboard/index.log
    if (process.env.mode !== 'dev') {
        autoUpdater.checkForUpdates();
    }

    autoUpdater.on('update-available', () => {
        dialog.showMessageBox({
            type: 'info',
            title: 'Update Available',
            message: '새 버전이 있습니다. 지금 업데이트 하시겠습니까?',
            buttons: ['업데이트', '아니오']
        }).then( result => {
            let buttonIndex = result.response;
            if (buttonIndex === 0) {
                autoUpdater.downloadUpdate();
            }
        })
    });

    autoUpdater.on('update-downloaded', () => {
        dialog.showMessageBox({
            type: 'info',
            title: 'Update ready',
            message: '지금 설치하고 재시작하시겠습니까?',
            buttons: ['업데이트', '나중에']
        }).then( result => {
            let buttonIndex = result.response;
            if (buttonIndex === 0) {
                autoUpdater.quitAndInstall(false, true);
            }
        })
    })
}
