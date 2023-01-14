'use strict';

const toMinute = seconds => {
  const minutes = Math.trunc(seconds / 60);
  const remainingSeconds = Math.trunc((seconds / 60 - minutes) * 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const measureElapsedTimeOnSec = () => {
  const startTime = process.hrtime();
  return () => {
    const elapsedTime = process.hrtime(startTime);
    return (elapsedTime[0] + elapsedTime[1] / 1e9).toFixed();
  };
};

module.exports = { toMinute, measureElapsedTimeOnSec };
