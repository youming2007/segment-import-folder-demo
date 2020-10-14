var fs = require('fs');
var parse = require('csv-parse');
var axios = require('axios');
var btoa = require('btoa');
var processData = require('./data-processing');
var logger = require('./winston');

var inputFolder = './data/input/';
var successFolder = './data/success/';
var errorFolder = './data/error/';

var writeKey = 'Q6CHDsH6KK7CS1K24rMUjXNTpibNCZ0w';

fs.readdirSync(inputFolder).forEach(file => {
  logger.log({
    level: 'info',
    message: `Start processing file: ${file}`
  });
  var parser = parse({ columns: false }, function(err, records) {
    if (err) {
      logger.log({
        level: 'error',
        message: err
      });
    }

    // Process data into JSON string
    let jsonBody = processData(records);

    axios
      .post('https://api.segment.io/v1/batch/', jsonBody, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(writeKey + ':')}`
        }
      })
      .then(res => {
        // Move to success folder
        fs.rename(inputFolder + file, successFolder + file, err => {
          if (err) {
            logger.log({
              level: 'error',
              message: err
            });
          }
        });
        logger.log({
          level: 'info',
          message: `End processing file: ${file}`
        });
      })
      .catch(error => {
        // Move to error folder
        fs.rename(inputFolder + file, errorFolder + file, err => {
          if (err) {
            logger.log({
              level: 'error',
              message: err
            });
          }
        });
        logger.log({
          level: 'error',
          message: error
        });
      });
  });

  try {
    fs.createReadStream(inputFolder + file).pipe(parser);
  } catch (err) {
    // Move to error folder
    fs.rename(inputFolder + file, errorFolder + file, err => {
      if (err) {
        logger.log({
          level: 'error',
          message: err
        });
      }
    });
    logger.log({
      level: 'error',
      message: err
    });
  }
});
