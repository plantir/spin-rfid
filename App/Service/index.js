const moment = require('moment');
const fs = require('fs');
class Service {
  constructor() {
    this.axios = require('axios').create({
      baseURL: process.env.API_URL,
      headers: {
        access_token: process.env.ACCESS_TOKEN
      }
    });
  }

  peresence({ rfid, presence_at }) {
    return this.axios.post('rfid/presence', { rfid, presence_at });
  }

  async send_log_file(date) {
    date =
      date ||
      moment(moment.now())
        .subtract(1, 'day')
        .format('YYYY-MM-DD');
    let file_name = `logs/${date}_log.json`;
    try {
      let file = await fs.readFileSync(file_name, 'utf8');
      file = file ? JSON.parse(file) : [];
      await this.axios.post('rfid/save_error_log', {
        data: file,
        filename: file_name.replace('logs/', '')
      });
    } catch (error) {
      console.log(error);
    }
  }
}
let service = new Service();
module.exports = service;
