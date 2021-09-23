const axios = require('axios');
const logger = require('electron-log');

class Request {
    constructor() {
    }

    get(url, config, successFn, failFn) {
        axios.get(url, config)
            .then((response) => {
                if (successFn) {
                    successFn(response);
                }
            })
            .catch(error => {
                if (error && failFn) {
                    failFn(error);
                }
            });
    }

    post(url, data, config, successFn, failFn) {
        axios.post(url, data, config)
            .then((response) => {
                if (successFn) {
                    successFn(response);
                }
            })
            .catch(error => {
                if (error) {
                    failFn(error);
                }
            });
    }

    /*all(urls, successFn, failFn) {
        axios.all(urls)
            .then((response) => {
                if (successFn) {
                    successFn(response);
                }
            })
            .catch(function (error) {
                if (error) {
                    failFn(error);
                }
            });
    }*/

    all(urls, successFn) {
        const _this = this;
        const promisesResolved = urls.map(promise => promise.catch(error => error.response));

        axios.all(promisesResolved)
            .then(_this.checkFailed(responses => {
                if (successFn) {
                    successFn(responses);
                }
            }))
            .catch((error) => {
                if (error) {
                    logger.error(error);
                }
            });
    }

    checkFailed (then) {
        return function (responses) {
            //const someFailed = responses.some(response => response.error)
            /*if (someFailed) {
                throw responses
            }*/

            return then(responses)
        }
    }
}

module.exports = Request;
