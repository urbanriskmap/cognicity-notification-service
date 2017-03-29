// External modules
const pg = require('pg');
require('dotenv').config({silent:true});
const fs = require('fs');
const AWS = require('aws-sdk');
AWS.config.update({region:process.env.AWS_REGION});

var sns = new AWS.SNS();

const conString = 'postgres://'+process.env.PGUSER+':'+process.env.PGPASSWORD+'@'+process.env.PGHOST+':'+process.env.PGPORT+'/'+process.env.PGDATABASE;

// Logging configuration
logparams = {};
logparams.level = process.env.LOG_LEVEL; // What level to log at; info, verbose or debug are most useful. Levels are (npm defaults): silly, debug, verbose, info, warn, error.
logparams.maxFileSize = 1024 * 1024 * 100; // Max file size in bytes of each log file; default 100MB
logparams.maxFiles = 10; // Max number of log files kept
logparams.logDirectory = process.env.LOG_DIR; // Set this to a full path to a directory - if not set logs will be written to the application directory.
logparams.filename = 'cognicity-notification-service'; // base filename to use

// Set up logging
var logPath = ( logparams.logDirectory ? logparams.logDirectory : __dirname );
// Check that log file directory can be written to
try {
	fs.accessSync(logPath, fs.W_OK);
} catch (e) {
	console.log( "Log directory '" + logPath + "' cannot be written to"  );
	throw e;
}
logPath += path.sep;
logPath += logparams.filename + ".log";

logger
	// Configure custom File transport to write plain text messages
	.add(logger.transports.File, {
		filename: logPath, // Write to projectname.log
		json: false, // Write in plain text, not JSON
		maxsize: logparams.maxFileSize, // Max size of each file
		maxFiles: logparams.maxFiles, // Max number of files
		level: logparams.level // Level of log messages
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

pg.connect(conString, function(err, client, done) {
  logger.info("Database connection successful");
  if (err){
    logger.error("database err: " + err);
    done();
  }
  // Return the listen notification
  client.on('notification', function(msg) {
    try {
      logger.info('Msg: ' + msg);
      logger.info('Payload: ' + msg.payload);
      var notification = JSON.parse(msg.payload);
      logger.info('Parse successful');

      var topicName = "";
      if (notification.cards.network === 'facebook'){
        logger.info('Received card submission via Facebook');
        topicName = "Facebook";
      } /* else if (notification.cards.network === 'telegram') {
        logger.info('Received card submission via Telegram');
        topicName = "Telegram";
      } else if (notification.cards.network === 'twitter') {
        logger.info('Received card submission via Twitter');
        topicName = "Twitter";
      } */

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
          TopicArn: "arn:aws:sns:" + process.env.AWS_REGION + ":" + process.env.ACCOUNTID + ":" + topicName
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
});
