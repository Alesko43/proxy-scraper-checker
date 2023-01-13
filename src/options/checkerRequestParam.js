'use strict';
const USERAGENTS = require('../sources/useragents.js');
const randomAgent = (
  USERAGENTS[Math.floor(Math.random() * USERAGENTS.length - 1)]
);
const checkerOptions = {
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': randomAgent
  },
};

module.exports = checkerOptions;
