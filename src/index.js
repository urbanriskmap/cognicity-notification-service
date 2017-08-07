// External modules
import Promise from 'bluebird'; // Promise support
const pgp = require('pg-promise')({ // PG
	promiseLib: Promise
});
import fs from 'fs';
import path from 'path';
import logger from 'winston';

// Config
import config from './config';
// Submodules
import { processAlert } from './channels/alerts';
import { processReply } from './channels/replies';
import SNS from './sns';

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

	// If we exit immediately winston does not get chance to write last log message
	const exitWithStatus = (status) => {
		logger.info(`Exiting with status ${status}`);
		setTimeout(() => process.exit(status), 500);
	};

	// Catch kill and interrupt signals and log a clean exit status
	process
		.on('SIGTERM', () => {
			logger.info('SIGTERM: Application shutting down');
			exitWithStatus(0);
		})
		.on('SIGINT', () => {
			logger.info('SIGINT: Application shutting down');
			exitWithStatus(0);
		});

logger.info("Application starting...");

let sco; // shared connection object

// Init SNS
const sns = new SNS(logger);

db.connect()
	.then(obj => {
		sco = obj;
		sco.client.on('notification', data => {
			console.log(data);
			let payload = JSON.parse(data.payload)

			if (data.channel === 'alerts'){
				processAlert(data)
					.then((data) => {
						logger.info('Processed notification from alert channel')
						sns.publish(data.topic, data.message)
					})
					.catch((err) => logger.error('Error processing notification from alert channel: ' + err))
			}
			else if (data.channel === 'watchers')
				processReply(payload)
					.then((data) => {
						console.log('topic, message:', data)
						logger.info('Processed notification from replies channel');
						sns.publish('test-cognicity', data.message);
					})
					.catch((err) => logger.error('Error processing notification from replies channel: ' + err))

			else {
				logger.info("Received notification from unknown channel: " + JSON.stringify(data));
			}
		});
		sco.none('LISTEN $1~', 'alerts');
		sco.none('LISTEN $1~', 'watchers');
	})
	.catch(error => {
		console.log('Error listening for database notifications: '+error);
	})
