// External modules
const pg = require('pg');
require('dotenv').config({silent:true});
const AWS = require('aws-sdk');
AWS.config.update({region:process.env.AWS_REGION});

var sns = new AWS.SNS();

const conString = 'postgres://'+process.env.PGUSER+':'+process.env.PGPASSWORD+'@'+process.env.PGHOST+':'+process.env.PGPORT+'/'+process.env.PGDATABASE;

pg.connect(conString, function(err, client, done) {
  console.log("Database connection successful");
  if (err){
    console.log("database err: " + err);
    done();
  }
  // Return the listen notification
  client.on('notification', function(msg) {
    try {
      console.log('Msg: ' + msg);
      console.log('Payload: ' + msg.payload);
      var notification = JSON.parse(msg.payload);
      console.log('Parse successful');

      var topicName = "";
      if (notification.cards.network === 'facebook'){
        console.log('Received card submission via Facebook');
        topicName = "Facebook";
      } else if (notification.cards.network === 'telegram') {
        console.log('Received card submission via Telegram');
        topicName = "Telegram";
      } else if (notification.cards.network === 'twitter') {
        console.log('Received card submission via Twitter');
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
          TopicArn: "arn:aws:sns:" + process.env.AWS_REGION + ":" + process.env.ACCOUNTID + ":" + topicName
        };
        console.log("Publishing to " + topicName + " SNS topic");
        sns.publish(params, function(err, data) {
          if (err) {
            console.log("Error on publishing message to topic" + topicName);
            console.log(err);
          } else {
            console.log("Message published to " + topicName + " SNS topic successfully");
            console.log(data);
          }
        });
      }
    } catch (e){
      console.log('Error processing listen notification from database\n'+e);
    }
  });
  // Initiate the listen query
  client.query("LISTEN watchers");
});
