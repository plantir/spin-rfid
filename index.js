'use strict';
require('dotenv').config({
  path: process.env.NODE_ENV == 'development' ? './.env.development' : './.env'
});
require('app-module-path').addPath('./');
require('App/Socket');
const SerialPort = require('serialport');
const Logger = require('App/Logger');
const Player = require('App/Player');
const Service = require('App/Service');
const Emitter = require('App/Emitter');
const moment = require('moment');
let connected = false;
let error_audio;
let type = 'presence';
Service.send_log_file();
Emitter.on('new-user', () => {
  type = 'assign';
});
Emitter.on('cancel', () => {
  type = 'presence';
});
setInterval(() => {
  if (connected) {
    return;
  }
  SerialPort.list().then(ports => {
    if (!ports || !ports.length) {
      return device_error('device not connected');
    }
    let { comName } = ports.find(item => item.manufacturer == 'Prolific');
    if (!comName) {
      return device_error('device not connected');
    }
    let port = new SerialPort(comName);

    port.on('data', async event => {
      if (!event) {
        return;
      }
      let data = event.toString().trim();
      if (!data || data.length < 9 || data == '000000000') {
        return;
      }
      if (type == 'presence') {
        try {
          let res = await Service.peresence({
            rfid: data,
            presence_at: moment()
          });
          if (process.env.SUCCESS_BUZZ == 'true') {
            Player.success();
          }
          Logger.log({
            level: 'info',
            title: 'presence-success',
            rfid: data
          });
        } catch (error) {
          if (process.env.WRONG_BUZZ == 'true') {
            Player.wrong();
          }
          Logger.log({
            level: 'error',
            title: 'presence-failed',
            error
          });
        }
      } else if (type == 'assign') {
        Emitter.emit('assign', data);
      }
    });

    port.on('open', x => {
      Logger.log({
        level: 'info',
        title: 'open-port',
        comName
      });
      connected = true;
      error_audio && error_audio.kill();
    });

    port.on('close', x => {
      Logger.log({
        level: 'info',
        title: 'close-port',
        comName
      });
      connected = false;
    });

    port.on('error', async err => {
      device_error(err);
    });
  });
}, 5000);

function device_error(error) {
  Logger.log({
    level: 'error',
    title: 'device-error',
    error
  });
  if (process.env.ERROR_BUZZ == 'true') {
    error_audio = Player.error();
  }
}
