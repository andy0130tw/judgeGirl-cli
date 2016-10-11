#!/usr/bin/env node

require('ssl-root-cas')
  .inject()
  .addFile(__dirname + '/cert/Let\'sEncryptAuthorityX3.crt');

var fs = require('fs');
var rp = require('request-promise')
  .defaults({});
var Promise = require('bluebird');
var observatory = require('observatory');
var strftime = require('strftime');
var chalk = require('chalk');

var constants = require('./lib/constants');
var util = require('./lib/util');

var program = require('commander');

program
  .version('0.0.1')
  .on('*', () => console.log(program.helpInformation()) )
  .command('live').description('Show live submission.')
  .action(cmdLive);

var BASE_URL = 'https://judgegirl.csie.org';

function checkStatusCode(errorMsg) {
  return (err) => {
    if (err.name == 'StatusCodeError') {
      if (errorMsg)
        console.trace(`Server responded with code ${err.statusCode}: ${errorMsg}`);
      else
        console.trace(`Server responded with code ${err.statusCode}.`);
    } else
      Promise.reject(err);
  };
}

function cmdLive() {
  var submissions = {};
  observatory.settings({
    width: 60,
    prefix: ' ',
    formatStatus: function(statusLabel, state) {
      if (!statusLabel) return '';
      var states = observatory.STATE;
      if (state === states.active) return chalk.yellow(statusLabel);
      if (state === states.done) return chalk.bold.green(statusLabel);
      if (state === states.fail) return chalk.bold.red(statusLabel);
      return statusLabel;
    }
  });

  function checkSubmissionLoop() {
    return rp(`${BASE_URL}/api/submission`, { json: true })
      .then(function(resp) {
        resp.reverse().forEach(function(v) {
          var task = submissions[v.sid];
          var pid = util.lpad(v.pid, 5);
          var title = util.pad(util.trim(v.ttl, 24), 24);
          var result = util.pad(constants.ENUM_RESULT[v.res], 4);
          var score = util.lpad(v.scr, 3);
          var submDate = strftime('%m-%d %H:%M:%S', new Date(v.ts));
          if (!task) {
            task = submissions[v.sid] = observatory.add(`${chalk.gray(v.sid)}  ${chalk.bold(pid)} ${title} ${chalk.blue(v.lgn)} ${submDate} `);
          }
          if (v.res == 0) {
            task.details('Judging...');
          } else if (v.res == 7) {
            task.details('').done('✓ ' + util.colorResult(result, 'AC'));
          } else {
            task.details('').fail('✗ ' + util.colorResult(result, constants.ENUM_RESULT[v.res]) + ` (${score})`);
          }
        });
      })
      .error(checkStatusCode());
  }

  function start() {
    return checkSubmissionLoop()
      .then(() => {
        setTimeout(start, 3000);
      })
      .catch((err) => {
        console.trace('Error when fetching live submissions', err);
        process.exit(1);
      });
  }
  start();
}

function cmdProbTask(probId) {
  if (isNaN(probId)) probId = 0;

  rp(`${BASE_URL}/${probId}/subtasks.py`)
    .then(function(resp) {
      console.log(resp);
      // return rp(`${BASE_URL}/${probId}`);
    }).catch(function(err) {

    });
}

program.parse(process.argv);

if (!program.args.length)
  console.log( program.helpInformation() );

