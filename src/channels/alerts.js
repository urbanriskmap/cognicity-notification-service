import Promise from 'bluebird';
/**
 * Process PostgreSQL Alert Notification
 * @function processAlert
 * @param {Object} payload PostgreSQL NOTIFY payload
 * @returns {Object} Promise - whether the notification was successfully issued to AWS SNS
 **/
const processAlert = ( payload ) => new Promise ((resolve, reject) => {
  console.log(JSON.stringify(payload));
  resolve(null);
});

module.exports = { processAlert };
