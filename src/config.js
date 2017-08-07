/**
 * Cognicity Notification Service configuration
 * @file config
 * @return {Object} App configuration
 */

/* eslint-disable max-len */
require('dotenv').config({silent:true});

export default {
  APP_NAME: process.env.APP_NAME || 'cognicity-notification-service',
  AWS_REGION: process.env.AWS_REGION || 'ap-southeast-1',
  PGCHANNEL_ALERTS: process.env.PGCHANNEL_ALERTS || 'alerts',
  PGCHANNEL_REPLIES: process.env.PGCHANNEL_REPLIES || 'replies',
  PGHOST: process.env.PGHOST || '127.0.0.1',
  PGDATABASE: process.env.PGDATABASE || 'cognicity',
  PGPASSWORD: process.env.PGPASSWORD || 'p@ssw0rd',
  PGPORT: process.env.PGPORT || 5432,
  PGSSL: process.env.PGSSL === 'true' || false,
  PGTIMEOUT: process.env.PGTIMEOUT || 10000,
  PGUSER: process.env.PGUSER || 'postgres',
  LOG_CONSOLE: process.env.LOG_CONSOLE === 'true' || false,
  LOG_DIR: process.env.LOG_DIR || '',
  LOG_JSON: process.env.LOG_JSON === 'true' || false,
  LOG_LEVEL: process.env.LOG_LEVEL || 'error',
  LOG_MAX_FILE_SIZE: process.env.LOG_MAX_FILE_SIZE || 1024 * 1024 * 100,
  LOG_MAX_FILES: process.env.LOG_MAX_FILES || 10,
}
