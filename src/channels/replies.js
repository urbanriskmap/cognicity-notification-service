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
