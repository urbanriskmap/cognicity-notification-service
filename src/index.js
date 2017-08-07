// External modules
import Promise from 'bluebird'; // Promise support
const pgp = require('pg-promise')({ // PG
	promiseLib: Promise
});
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
import logger from 'winston'; // logging

import { processAlert } from './channels/alerts';
import { processReply } from './channels/replies';

import config from './config';

// Set globals
AWS.config.update({region:config.AWS_REGION});

// Init AWS SNS
var sns = new AWS.SNS();

// Init database
const conString = 'postgres://'+config.PGUSER+':'+config.PGPASSWORD+'@'+config.PGHOST+':'+config.PGPORT+'/'+config.PGDATABASE;
let db = pgp(conString);

// Set the default logging level
logger.level = config.LOG_LEVEL;

// Check that log file directory can be written to
try {
	if (config.LOG_DIR !== '') {
		fs.accessSync(config.LOG_DIR, fs.W_OK);
	}
	logger.info(`Logging to ${config.LOG_DIR !== '' ? config.LOG_DIR :
							'current working directory' }`);
} catch (e) {
	// If we cannot write to the desired directory then log tocurrent directory
	logger.info(`Cannot log to '${config.LOG_DIR}',
							logging to current working directory instead`);
	config.LOG_DIR = '';
}

logger
	// Configure custom File transport to write plain text messages
	.add(logger.transports.File, {
		filename: path.join(config.LOG_DIR, `${config.APP_NAME}.log`),
		json: config.LOG_JSON, // Write in plain text, not JSON
		maxsize: config.LOG_MAX_FILE_SIZE, // Max size of each file
		maxFiles: config.LOG_MAX_FILES, // Max number of files
		level: config.LOG_LEVEL // Level of log messages
	})
	// Console transport is no use to us when running as a daemon
	.remove(logger.transports.Console);

// FIXME This is a workaround for https://github.com/flatiron/winston/issues/228
// If we exit immediately winston does not get a chance to write the last log message.
// So we wait a short time before exiting.
function exitWithStatus(exitStatus) {
	logger.info( "Exiting with status " + exitStatus );
	setTimeout( function() {
		process.exit(exitStatus);
	}, 500 );
}

logger.info("Application starting...");

let sco; // shared connection object

db.connect()
	.then(obj => {
		sco = obj;
		sco.client.on('notification', data => {
			if (data.channel === 'alerts'){
				processAlert(data);
			}
			else if (data.channel === 'watchers')
				processReply(data);
			else {
				logger.info("Received notification from unknown channel: " + JSON.stringify(data));
			}
		});
		sco.none('LISTEN $1~', 'alerts');
		sco.none('LISTEN $1~', 'watchers');
	})
	.catch(error => {
		console.log('Error: '+error);
	})

/*
pg.connect(conString, function(err, client, done) {
  logger.info("Database connection successful");
  if (err){
    logger.error("database err: " + err);
    done();
  }
  // Return the listen notification
  client.on('notification', function(msg) {
		console.log(msg)

    /*try {
      logger.info('Msg: ' + msg);
      logger.info('Payload: ' + msg.payload);
      var notification = JSON.parse(msg.payload);
      logger.info('Parse successful');

      var topicName = "";
      if (notification.cards.network === 'facebook'){
        logger.info('Received card submission via Facebook');
        topicName = "Facebook";
      } else if (notification.cards.network === 'telegram') {
        logger.info('Received card submission via Telegram');
        topicName = "Telegram";
      } else if (notification.cards.network === 'twitter') {
        logger.info('Received card submission via Twitter');
        topicName = "Twitter";
      }

      //Construct JSON with relevant details for a confirmation response to be published to SNS topic
      var jsonMessage = {
        "language" : notification.cards.language,
        "username" : notification.cards.username,
        "implementation_area": notification.cards.report_impl_area,
        "report_id": notification.cards.report_id
      };
      if(topicName !== "")
      {
        //Construct message payload
        var params = {
          Message: JSON.stringify(jsonMessage),
          TopicArn: "arn:aws:sns:" + config.AWS_REGION + ":" + config.ACCOUNTID + ":" + topicName
        };
        logger.info("Publishing to " + topicName + " SNS topic");
        sns.publish(params, function(err, data) {
          if (err) {
            logger.error("Error on publishing message to topic" + topicName);
            logger.error(err);
          } else {
            logger.info("Message published to " + topicName + " SNS topic successfully");
            logger.debug(data);
          }
        });
      }
    } catch (e){
      logger.error('Error processing listen notification from database\n'+e);
    }
  });
  // Initiate the listen query
  client.query("LISTEN watchers");
	client.query("LISTEN alerts");

});*/
