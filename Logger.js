const path = require('path');
const UUID = require('uuid/v1');
const fs = require('fs');
const axios = require('axios')
const config = require('./config.json');
var FormData = require('form-data');

var exporting = {};

let lastSentDate = null;

setInterval(() => {

    var today = (new Date()).setHours(0, 0, 0, 0);

    // Check if already sent or not
    const lastSentDay = lastSentDate == null ? null : lastSentDate.setHours(0, 0, 0, 0);
    if (lastSentDate == null || lastSentDate.setHours(0, 0, 0, 0) !== today) {

        const yesterday = new Date((new Date()).getTime() - 24 * 60 * 60 * 1000);

        const dirName = path.join(__dirname, 'logs', 'daily-id', `${yesterday.getFullYear()}-${zeroPad(yesterday.getMonth() + 1)}`);
        const fileName = `${yesterday.getFullYear()}-${zeroPad(yesterday.getMonth() + 1)}-${zeroPad(yesterday.getDate())}.log`;
        const yesterdayFileName = path.join(dirName, fileName);

        const newDirName = path.join(__dirname, 'logs', 'archived-daily-id', `${yesterday.getFullYear()}-${zeroPad(yesterday.getMonth() + 1)}`);

        var newFileName = path.join(newDirName, fileName)

        if (!fs.existsSync(yesterdayFileName)) {
            lastSentDate = new Date();

            uploadFile(config.dailyReviewEndpoint, newFileName);
            return;
        }

        if (!fs.existsSync(newDirName))
            fs.mkdirSync(newDirName, { recursive: true });

        fs.renameSync(yesterdayFileName, newFileName);

        uploadFile(config.dailyReviewEndpoint, newFileName);    }
}, 5000);

async function uploadFile(endpoint, newFileName) {

    let stream = fs.createReadStream(newFileName);
    const form = new FormData();
    form.append('field', stream, path.basename(newFileName));
    axios.post(endpoint, form, {
        headers: {
            ...form.getHeaders(),
            "Authorization": "Bearer " + config.accessToken,
        },
    }).then(result => {
        //console.log(result.data);
    }).catch((ex) => {
        exporting.errorLog(ex);
    });

    return;
}

async function postData(endpoint, dataJSON = {}, successCallback, errorCallback) {

    const requestConfig = {
        method: "post",
        url: endpoint,
        headers: { "Authorization": "Bearer " + config.accessToken },
    };

    axios.post(endpoint, dataJSON, requestConfig)
        .then((res) => {
            if (successCallback)
                successCallback(res);
        })
        .catch((error) => {
            if (errorCallback)
                errorCallback(error);
        });
}

async function writeText(dirName, fileName, content) {
    var fullPath = path.join(dirName, fileName);

    if (!fs.existsSync(dirName))
        fs.mkdirSync(dirName, { recursive: true });

    var accessLogStream = fs.createWriteStream(fullPath, { flags: 'a' })
    accessLogStream.write(content);
}

function zeroPad(n) {
    return ('0' + n).slice(-2);
}

exporting.errorLog = (ex, submit, desc = "") => {

    const now = new Date(new Date().getTime());
    const dirName = path.join(__dirname, 'logs', 'errors', `${now.getFullYear()}-${zeroPad(now.getMonth() + 1)}-${now.getUTCDate()}`);
    const fileName = `${zeroPad(now.getHours())}-${zeroPad(now.getMinutes())}-${zeroPad(now.getSeconds())}-${now.getMilliseconds()}-${UUID()}.log`;

    const content = `${now.toUTCString()}\n${ex.message}\n${ex.stack}\n${desc}`;

    writeText(dirName, fileName, content);

    if (submit)
        postData(config.errorEndpoint, { message: ex.message, stack: ex.stack });
}

exporting.idLog = async (id) => {
    const now = new Date();
    const dirName = path.join(__dirname, 'logs', 'daily-id', `${now.getFullYear()}-${zeroPad(now.getMonth() + 1)}`);
    const fileName = `${now.getFullYear()}-${zeroPad(now.getMonth() + 1)}-${zeroPad(now.getDate())}.log`;
    const content = `${now.getFullYear()}/${zeroPad(now.getMonth() + 1)}/${zeroPad(now.getDate())} ${zeroPad(now.getHours())}:${zeroPad(now.getMinutes())}:${zeroPad(now.getSeconds())}\t${id}\n`;
    writeText(dirName, fileName, content);

    postData(config.idEndpoint, { id: id },
        null,
        (err) => {
            exporting.errorLog(err, "Thrown in send id to server.");
        });
}

exporting.openPortLog = async (portName, retryCount) => {
    const now = new Date();
    const dirName = path.join(__dirname, 'logs', 'open-port', `${now.getFullYear()}-${zeroPad(now.getMonth() + 1)}-${now.getUTCDate()}`);
    const fileName = `${zeroPad(now.getHours())}-${zeroPad(now.getMinutes())}-${zeroPad(now.getSeconds())}-${now.getMilliseconds()}-${UUID()}.log`;
    const content = `${now.toUTCString()}\n${portName}\nRetry count: ${retryCount}`;
    writeText(dirName, fileName, content);
}

exporting.closePortLog = async (portName) => {
    const now = new Date();
    const dirName = path.join(__dirname, 'logs', 'close-port', `${now.getFullYear()}-${zeroPad(now.getMonth() + 1)}-${now.getUTCDate()}`);
    const fileName = `${zeroPad(now.getHours())}-${zeroPad(now.getMinutes())}-${zeroPad(now.getSeconds())}-${now.getMilliseconds()}-${UUID()}.log`;
    const content = `${now.toUTCString()}\n${portName}`;
    writeText(dirName, fileName, content);
}

module.exports = exporting;