/**
 * AWS SNS Class
 * @module sns/index
 * @param {Object} logger Configured Winston logger instance
 **/

import Promise from 'bluebird';
import AWS from 'aws-sdk';
import config from '../config';

// Set globals
AWS.config.update({region:config.AWS_REGION});

// Init AWS SNS
var sns = new AWS.SNS();

module.exports = class SNS {
  /**
   * Setup the SNS object to user specified logger
   * @alias module:lib/cap
   * @param {Object} logger Configured Winston logger instance
   */
  constructor(logger) {
    this.logger = logger;
  }

  publish(topic, message){
    let self = this;

    //Construct message payload
    var params = {
      Message: JSON.stringify(message),
      TopicArn: "arn:aws:sns:" + config.AWS_REGION + ":" + config.AWS_ACCOUNTID + ":" + topic
    };
    self.logger.info("Publishing to " + topic + " SNS topic");
    sns.publish(params, function(err, data) {
      if (err) {
        self.logger.error("Error on publishing message to topic" + topic);
        self.logger.error(err);
        return(err);
      } else {
        self.logger.info("Message published to " + topic + " SNS topic successfully");
        self.logger.debug(data);
        return(null);
      }
    });
  }
};
