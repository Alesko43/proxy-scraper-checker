'use strict';
const axios = require('axios');
const checkerOptions = require('../options/checkerRequestParam.js');
const pLimit = require('p-limit');
const { yellow, green, red } = require('../helpers/Colorer.js');

const checkerLogger = count => {
  let index = 0;
  const stats = { success: 0, failed: 0 };
  return isSuccess => {
    const progress = ((index++ / count) * 100).toFixed(1);
    process.stdout.write(
      yellow('[CHECKER WORKING]') +
      ' Checking count: ' + green(count) +
      yellow('|') +
      'Alive: ' + green((isSuccess ? ++stats.success : stats.success)) +
      yellow('|') +
      'Dead: ' + red((isSuccess ? stats.failed : ++stats.failed)) +
      yellow('|') +
      'Progress: ' + green(progress + '%') + '\r'
    );
    if (count === index) {
      console.log(
        green('[CHECKER COMPLETED]') +
        ' Checking count: ' + green(count) +
        yellow('|') +
        'Alive: ' + green(stats.success) +
        yellow('|') +
        'Dead: ' + red(stats.failed) +
        yellow('|') +
        'Progress: ' +  green('100%')
      );
    }
  };
};

const makeRequest = async (
  proxyRepository,
  logger,
  proxy,
) => {
  const { ip, port } = proxy;
  const proxySettings = {
    proxy: {
      host: ip.toString(),
      port,
    },
    timeout: 10000,
  };

  try {
    const req = await axios.get('http://google.com', proxySettings);
    if (req.status !== 200)  return;
    const geoReq = await axios.get(`http://ip-api.com/json/${ip}`, checkerOptions);
    const { countryCode } = geoReq.data;
    logger(true);
    await proxyRepository.insertCheckedProxy(ip, port, countryCode);
  } catch (err) {
    logger(false);
  }
};

const proxyChecker = async proxyRepository => {
  const scrapedProxies = await proxyRepository.getTableData('proxies');
  const checkedProxies = await proxyRepository.getTableData('checked_proxies');
  const proxies = [...checkedProxies, ...scrapedProxies];
  const proxiesCount = proxies.length;
  const logger = checkerLogger(proxiesCount);
  const threat = parseInt(process.env.CHECKER_THREAT);
  const queue = pLimit(threat);
  const promises = [];
  for (const proxy of proxies) {
    promises.push(queue(() =>
      makeRequest(proxyRepository, logger, proxy)
    ));
  }
  return await Promise.all(promises);
};

module.exports = proxyChecker;
