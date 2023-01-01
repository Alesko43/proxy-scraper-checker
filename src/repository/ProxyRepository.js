'use strict';
const Client = require('pg').Client;

class ProxyRepository {
  constructor(config = null, saveLogFn = null) {
    this.client = new Client(config);
    this.client.connect();
    this.saveLog = saveLogFn;
  }

  async query(query, params) {
    try {
      const result = params ?
        await this.client.query(query, params) :
        await this.client.query(query);
      return result;
    } catch (error) {
      throw new Error(error.message ? error.message : error);
    }
  }

  async close() {
    try {
      await this.client.end();
    } catch (error) {
      throw new Error(error.message ? error.message : error);
    }
  }

  async migrateTables() {
    const createScrapedProxiesTableQuery = `
			CREATE TABLE IF NOT EXISTS proxies (
				id SERIAL PRIMARY KEY,
				ip VARCHAR(15) NOT NULL,
				port INTEGER NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			);
			`;

    const createCheckedProxiesTableQuery = `
			CREATE TABLE IF NOT EXISTS checked_proxies (
				id SERIAL PRIMARY KEY,
				ip VARCHAR(15) NOT NULL,
				port INTEGER NOT NULL,
				country VARCHAR(3) NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
				updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			);
			`;

    await this.query(createScrapedProxiesTableQuery);
    await this.query(createCheckedProxiesTableQuery);
  }

  async getTableData(tableName) {
    const query = `SELECT * FROM ${tableName}`;
    const result = await this.query(query);
    return result.rows;
  }

  async checkedProxiesLogSave() {
    const checkedProxies = await this.getTableData('checked_proxies');
    this.saveLog(checkedProxies);
  }

  async insertScrapedProxy(proxy) {
    const insertProxyQuery = 'INSERT INTO proxies (ip, port) VALUES ($1, $2);';
    const [ip, port] = proxy.split(':');
    await this.query(insertProxyQuery, [ip, port]);
  }

  async insertCheckedProxy(ip, port, countryCode) {
    const proxyExistQuery = 'SELECT * FROM checked_proxies WHERE ip = $1;';

    const updateExistProxyQuery = `
    UPDATE checked_proxies SET
    updated_at = CURRENT_TIMESTAMP WHERE ip = $1;
    `;

    const insertProxyQuery = `
    INSERT INTO checked_proxies (ip, port, country) VALUES 
    ($1, $2, $3);`;

    const proxyIsExist = await this.query(proxyExistQuery, [ip]);

    if (proxyIsExist.rowCount > 0) {
      await this.query(updateExistProxyQuery, [ip]);
      return;
    }

    await this.query(insertProxyQuery, [ip, port, countryCode]);
  }
}

module.exports = ProxyRepository;
