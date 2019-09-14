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
}
let service = new Service();
module.exports = service;
