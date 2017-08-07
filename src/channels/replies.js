import Promise from 'bluebird';

/**
 * Process PostgreSQL Reply Notification
 * @function processReply
 * @param {Object} payload PostgreSQL NOTIFY payload
 * @returns {Object} Promise - whether the notification was successfully issued to AWS SNS
 **/
const processReply = ( payload ) => new Promise ((resolve, reject) => {
  let topicName = "";
  if (payload.cards.network === 'facebook'){
    topicName = "Facebook";
  } else if (payload.cards.network === 'telegram') {
    topicName = "Telegram";
  } else if (payload.cards.network === 'twitter') {
    topicName = "Twitter";
  }

  //Construct JSON with relevant details for a confirmation response to be published to SNS topic
  let jsonMessage = {
    "language" : payload.cards.language,
    "username" : payload.cards.username,
    "implementation_area": payload.cards.report_impl_area,
    "report_id": payload.cards.report_id
  };
  if(topicName !== ""){
    console.log(topicName, jsonMessage)
      resolve({"topic": topicName, "message": jsonMessage})
  }
  else {
    reject(new Error('No network specified'));
  }
});

module.exports = { processReply };
