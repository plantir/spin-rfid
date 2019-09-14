const winston = require('winston');
const CustomTransport = require('./CustomTransport');
const moment = require('moment');

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new CustomTransport({
      filename:
        'logs/' + moment(moment.now()).format('YYYY-MM-DD') + '_log.json',
      handleExceptions: true
    })
  ]
});

module.exports = logger;
