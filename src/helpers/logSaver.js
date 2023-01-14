'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { dateParser, timeParser } = require('./dates.js');
const { yellow, green } = require('./Colorer.js');

const fileIsExist = filename => {
  const defaultPath = path.join(__dirname, '../..', `/logs/${filename}.log`);
  const isExist = fs.existsSync(defaultPath);
  return isExist;
};

const removeFile = filename => {
  const defaultPath = path.join(__dirname, '../..', `/logs/${filename}.log`);
  fs.unlinkSync(defaultPath);
};

const writeFile = (filename, data) => {
  const defaultPath = path.join(__dirname, '../..', `/logs/${filename}.log`);
  fs.appendFileSync(defaultPath, data + '\n', 'utf8');
};

const createFile = async filename => {
  const defaultPath = path.join(__dirname, '../..', `/logs/${filename}.log`);
  const title = dateParser() + ' | ' + timeParser() + ' | Alesko | https://github.com/Alesko43/proxy-scraper-checker\n\n';
  fs.writeFileSync(defaultPath, title, 'utf8');
};

const saveErrorsToLog = errors => {
  const errorFileName = 'errors';
  const isExist = fileIsExist(errorFileName);

  if (isExist) removeFile(errorFileName);
  createFile(errorFileName);

  for (const key in errors) {
    const value = errors[key];
    const error = 'URL: ' + key + ' | Error: ' + value;
    writeFile(errorFileName, error);
  }
};

const saveAlivesToLog = proxies => {
  const aliveFileName = 'alive_proxies';
  const isExist = fileIsExist(aliveFileName);

  if (isExist) removeFile(aliveFileName);
  createFile(aliveFileName);

  for (const proxy of proxies) {
    const { ip, port, country, createdAt, updatedAt } = {
      ...proxy,
      createdAt: proxy.created_at,
      updatedAt: proxy.updated_at,
    };

    const updatedDate = dateParser(updatedAt);
    const updatedTime = timeParser(updatedAt);

    const createdDate = dateParser(createdAt);
    const createdTime = timeParser(createdAt);

    const parsedData =
    'Updated: ' + updatedDate + ' ' + updatedTime +
    ' | Created: ' + createdDate + ' ' + createdTime +
    ' | ' + country + ' | ' + ip + ':' + port;
    writeFile(aliveFileName, parsedData);
  }
  console.log(
    yellow('[LOGFILE]') +
    'Saved to alive proxies =>' +
    green(aliveFileName + '.log')
  );
};
module.exports = { saveErrorsToLog, saveAlivesToLog };
