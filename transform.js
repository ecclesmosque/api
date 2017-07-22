const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');
const moment = require('moment');
const hijri = require('moment-hijri');
const mkdirp = require('mkdirp');

const CSV_BASE_PATH = __dirname + '/_data/prayer-times';
const JSON_BASE_PATH = __dirname + '/_prayer-times';

const getDataFilesFrom = (dir) =>
  fs.readdirSync(dir)
    .reduce((files, file) =>
      fs.statSync(path.join(dir, file)).isDirectory() ?
        files.concat(getDataFilesFrom(path.join(dir, file))) :
        files.concat(path.join(dir, file)),
    []);

const saveDailyJSON = (data) => {

  let DATE_JSON_FILE = JSON_BASE_PATH + '/' + moment(data.DATE).format('YYYY/MM/DD') + '.json'

  let DATE_JSON_FILE_DIR = path.dirname(DATE_JSON_FILE);

  mkdirp(DATE_JSON_FILE_DIR, function (err) {
    if (err) console.error(err);
    fs.writeFile(DATE_JSON_FILE, JSON.stringify(data), 'utf-8', function (err) {
      if (err) throw err
    });

  });

};

const saveMonthlyJSON = (date, data) => {

  let DATE_JSON_FILE = JSON_BASE_PATH + '/' + moment(date + '-01').format('YYYY/MM/[all]') + '.json'

  let DATE_JSON_FILE_DIR = path.dirname(DATE_JSON_FILE);

  mkdirp(DATE_JSON_FILE_DIR, function (err) {
    if (err) console.error(err);
    fs.writeFile(DATE_JSON_FILE, JSON.stringify(data), 'utf-8', function (err) {
      if (err) throw err
    });

  });

};

const dataFiles = getDataFilesFrom(CSV_BASE_PATH);

dataFiles.forEach(function (datafile) {
  // console.log('Processing data file:', datafile);
  let YYYYMM = path.parse(datafile).name;
  let monthlyJSON = [];

  csv({ workerNum: require('os').cpus().length })
    .fromFile(datafile)
    .transf((jsonObj, csvRow, index) => {

      let DATE = YYYYMM + '-' + jsonObj.DATE;

      jsonObj.DATE = DATE;

      jsonObj.DAY = moment(DATE).format('dddd');

      jsonObj.DATE_HIJRI = hijri(DATE).format('iYYYY/iMM/iD');

      jsonObj.FAJR.STARTS = moment(DATE + ' ' + jsonObj.FAJR.STARTS).format();
      jsonObj.FAJR.JAMAAT = moment(DATE + ' ' + jsonObj.FAJR.JAMAAT).format();
      jsonObj.FAJR.STARTS_HUMAN_READABLE = moment(jsonObj.FAJR.STARTS).format('hh:mm a');
      jsonObj.FAJR.JAMAAT_HUMAN_READABLE = moment(jsonObj.FAJR.JAMAAT).format('hh:mm a');

      jsonObj.SUNRISE.STARTS = moment(DATE + ' ' + jsonObj.SUNRISE.STARTS).format();
      jsonObj.SUNRISE.STARTS_HUMAN_READABLE = moment(jsonObj.SUNRISE.STARTS).format('hh:mm a');

      jsonObj.DHUHUR.STARTS = moment(DATE + ' ' + jsonObj.DHUHUR.STARTS).format();
      jsonObj.DHUHUR.JAMAAT = moment(DATE + ' ' + jsonObj.DHUHUR.JAMAAT).format();
      jsonObj.DHUHUR.STARTS_HUMAN_READABLE = moment(jsonObj.DHUHUR.STARTS).format('hh:mm a');
      jsonObj.DHUHUR.JAMAAT_HUMAN_READABLE = moment(jsonObj.DHUHUR.JAMAAT).format('hh:mm a');

      jsonObj.ASR.STARTS = moment(DATE + ' ' + jsonObj.ASR.STARTS).format();
      jsonObj.ASR.JAMAAT = moment(DATE + ' ' + jsonObj.ASR.JAMAAT).format();
      jsonObj.ASR.STARTS_HUMAN_READABLE = moment(jsonObj.ASR.STARTS).format('hh:mm a');
      jsonObj.ASR.JAMAAT_HUMAN_READABLE = moment(jsonObj.ASR.JAMAAT).format('hh:mm a');

      jsonObj.MAGHRIB.STARTS = moment(DATE + ' ' + jsonObj.MAGHRIB.JAMAAT).format();
      jsonObj.MAGHRIB.JAMAAT = moment(DATE + ' ' + jsonObj.MAGHRIB.JAMAAT).format();
      jsonObj.MAGHRIB.STARTS_HUMAN_READABLE = moment(jsonObj.MAGHRIB.STARTS).format('hh:mm a');
      jsonObj.MAGHRIB.JAMAAT_HUMAN_READABLE = moment(jsonObj.MAGHRIB.JAMAAT).format('hh:mm a');

      jsonObj.ISHA.STARTS = moment(DATE + ' ' + jsonObj.ISHA.STARTS).format();
      jsonObj.ISHA.JAMAAT = moment(DATE + ' ' + jsonObj.ISHA.JAMAAT).format();
      jsonObj.ISHA.STARTS_HUMAN_READABLE = moment(jsonObj.ISHA.STARTS).format('hh:mm a');
      jsonObj.ISHA.JAMAAT_HUMAN_READABLE = moment(jsonObj.ISHA.JAMAAT).format('hh:mm a');

    })
    .on('json', (jsonObj) => {

      monthlyJSON.push(jsonObj);
      saveDailyJSON(jsonObj)

    });

  saveMonthlyJSON(YYYYMM, monthlyJSON);


}, this);
