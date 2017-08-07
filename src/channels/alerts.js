import Promise from 'bluebird';
/**
 * Process PostgreSQL Alert Notification
 * @function processAlert
 * @param {Object} payload PostgreSQL NOTIFY payload
 * @returns {Object} Promise - whether the notification was successfully issued to AWS SNS
 **/
const processAlert = ( payload ) => new Promise ((resolve, reject) => {
  console.log(JSON.stringify(payload));

  // TODO - define message parameters
  let jsonMessage = {
    "language" : payload.cards.language,
    "username" : payload.cards.username,
    "implementation_area": payload.cards.report_impl_area,
    "report_id": payload.cards.report_id
  };
  if(topicName !== ""){
    console.log(topicName, jsonMessage)
      resolve({"topic": 'test-cognicity', "message": "ALERT. PetaBencana.id received report of flooding near your location."});
  }
  else {
    reject(new Error('No network specified'));
  }
  resolve(null);
});

module.exports = { processAlert };
