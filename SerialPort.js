const SerialPort = require('serialport');
const config = require('./config.json');
const player = require('play-sound')(opts = {})
const logger = require('./Logger');

module.exports = function (newIdCallback) {

    this.readTimer = null;
    this.readData = "";

    this.retryTimer = null
    this.retryCount = 0;

    this.retry = () => {
        this.retryTimer = setInterval(() => {
            if (!this.serialport.isOpen) {
                this.retryCount++;
                this.serialport.open();
            }
        }, 5000);
    }

    this.serialport = new SerialPort(config.comName);
    
    this.serialport.on('readable', () => {
            
        this.serialport.read();
    });

    this.serialport.on("data", (data) => {

        if (!data)
            return;

        let dataSting = data.toString();
        if (!dataSting)
            return;

        dataSting = dataSting.trim();
        if (!dataSting)
            return;

        if (this.readTimer)
            clearTimeout(this.readTimer);

        this.readData = this.readData + dataSting;

        this.readTimer = setTimeout(() => {

            if (config.idBuzzEnabled)
                player.play('beep.mp3', function (err) { });

            if (newIdCallback)
                newIdCallback(this.readData);

            this.readData = "";

        }, 1000);
    });

    this.serialport.on("open", (x) => {
        console.log("Open");
        logger.openPortLog(config.comName, this.retryCount);
        this.retryCount = 0;
    });

    this.serialport.on("close", (x) => {
        console.log("Close");
        logger.closePortLog(config.comName);

        if (!this.retryTimer)
            this.retry();
    });

    this.serialport.on('error', async (err) => {
        console.log("Error", err);
        let availablePorts = `Available ports:\n`;
        const ports = await SerialPort.list();

        ports.forEach(function (port) {
            availablePorts += JSON.stringify(port, null, 2) + "\n";
        });

        if (config.errorBuzzEnabled && this.retryCount < config.errorBuzzUntil) {
            let audio = player.play('error.mp3', function (err) { });
            setInterval(() => {
                audio.kill();
            }, 4000);
        }

        if (err)
            logger.errorLog(err, this.retryCount === config.retryCount, availablePorts);

        if (this.retryCount === config.retryCount) {
            clearInterval(this.retryTimer);
            return;
        }

        if (!this.retryTimer)
            this.retry();
    });
}