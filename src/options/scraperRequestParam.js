'use strict';
const USERAGENTS = require('../sources/useragents.js');
const randomAgent = (
  USERAGENTS[Math.floor(Math.random() * USERAGENTS.length - 1)]
);
const SCRAPER_REQ_OPTIONS = {
  headers: {
    'Accept-Encoding': 'gzip,deflate,compress',
    'Content-Type': '*/*',
    'User-Agent': randomAgent
  },
};

module.exports = SCRAPER_REQ_OPTIONS;
