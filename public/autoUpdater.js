const { autoUpdater } = require('electron-updater');
const { dialog } = require('electron');
const logger = require('electron-log');
logger.transports.file.level = 'info';
autoUpdater.autoDownload = false;

module.exports = (app, mainWindow) => {
    logger.info('Checking for updates: ' + process.env.mode);

    if (process.env.mode !== 'dev') {
        logger.info('autoUpdater.checkForUpdates() start');
        autoUpdater.checkForUpdates();
        logger.info('autoUpdater.checkForUpdates() end');
    }

    autoUpdater.on('update-available', () => {
        logger.info("update-available");
        dialog.showMessageBox({
            type: 'info',
            title: 'Update Available',
            message: '새 버전이 있습니다. 지금 업데이트 하시겠습니까?',
            buttons: ['업데이트', '아니오']
        }).then( result => {
            let buttonIndex = result.response;
            logger.info("update-available buttonIndex: " + buttonIndex);
            if (buttonIndex === 0) {
                logger.info("autoUpdater.downloadUpdate");
                autoUpdater.downloadUpdate();
            }
        })
    });

    autoUpdater.on('update-downloaded', () => {
        logger.info("update-downloaded");
        dialog.showMessageBox({
            type: 'info',
            title: 'Update ready',
            message: '지금 설치하고 재시작하시겠습니까?',
            buttons: ['업데이트', '나중에']
        }).then( result => {
            let buttonIndex = result.response;
            logger.info("update-downloaded buttonIndex: " + buttonIndex);
            if (buttonIndex === 0) {
                setImmediate(() => {
                    app.removeAllListeners("window-all-closed")
                    if (mainWindow != null) {
                        mainWindow.close()
                    }
                    autoUpdater.quitAndInstall(false)
                })

                /*setTimeout(() => {
                    logger.info("autoUpdater.quitAndInstall");
                    autoUpdater.quitAndInstall(false, true);
                }, 6000);*/
            }
        })
    })

    return {
        checkUpdate() {
            return autoUpdater.checkForUpdates();
        }
    }
}
