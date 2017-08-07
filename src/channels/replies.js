import Promise from 'bluebird';
/**
 * @function processReply
 * @param {Object} notification PostgreSQL NOTIFY Payload
 * @returns {Object} Promise - whether the notification was successfully issued to AWS SNS
 **/
const processReply = ( notification ) => new Promise ((resolve, reject) => {
  console.log(notification);
  resolve(null);
});

module.exports = { processReply };
