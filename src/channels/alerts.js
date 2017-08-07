import Promise from 'bluebird';
/**
 * @function processAlert
 * @param {Object} notification PostgreSQL NOTIFY Payload
 * @returns {Object} Promise - whether the notification was successfully issued to AWS SNS
 **/
const processAlert = ( notification ) => new Promise ((resolve, reject) => {
  console.log(notification);
  resolve(null);
});

module.exports = { processAlert };
