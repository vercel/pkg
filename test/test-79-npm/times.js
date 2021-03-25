'use strict';

const https = require('https');
const foldyNames = process.argv[2].split(',');

const results = {};
process.on('exit', function () {
  console.log(JSON.stringify(results));
});

for (let i = 0; i < 10; i += 1) {
  nextJob();
}

function nextJob() {
  if (foldyNames.length === 0) return;
  queueJob(foldyNames.shift());
}

function queueJob(foldyName) {
  getLatestTime(foldyName, function (error, latestTime) {
    if (error) console.error(error);
    results[foldyName] = new Date(latestTime).getTime();
    setTimeout(nextJob, 0);
  });
}

function getLatestTime(foldyName, cb) {
  https
    .get('https://registry.npmjs.org/' + foldyName, function (response) {
      let s = '';
      response.on('data', function (chunk) {
        s += chunk;
      });
      response.on('end', function () {
        const json = JSON.parse(s);
        const distTags = json['dist-tags'];
        if (!distTags) return cb(undefined, Date.now()); // express-with-jade
        const latest = distTags.latest;
        cb(undefined, json.time[latest]);
      });
      response.on('error', function (error) {
        cb(error);
      });
    })
    .on('error', function (error) {
      cb(error);
    });
}
