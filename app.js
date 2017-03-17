// External modules
const pg = require('pg');
require('dotenv').config({silent:true});
const AWS = require('aws-sdk');
AWS.config.update({region:process.env.AWS_REGION});

var express = require('express')
var app = express()
var sns = new AWS.SNS()

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
  // Connect to db
  pg.connect(process.env.PG_CON, function(err, client, done){
     console.log("Database connection successful");
     if (err){
       console.log("database err: " + err);
       done();
     }
     // Return the listen notification
     client.on('notification', function(msg) {
       try{
        console.log('Msg: ' + msg);
        console.log('Payload: ' + msg.payload);
        var notification = JSON.parse(msg.payload);
        console.log('Parse successful');
        if (notification.cards.network === 'facebook'){
          console.log('Received card submission');

          //Construct JSON with relevant details for a confirmation response to be published to SNS topic
          var jsonMessage = {
            "language" : notification.cards.language,
            "username" : notification.cards.username,
            "implementation_area": notification.cards.report_impl_area,
            "report_id": notification.cards.report_id
          };

          //Construct message payload
          var params = {
            Message: JSON.stringify(jsonMessage),
            TopicArn: "arn:aws:sns:" + process.env.AWS_REGION + ":" + process.env.ACCOUNTID + ":Facebook"
          };
          console.log("Publishing to Facebook SNS topic");
          sns.publish(params, function(err, data) {
            if (err) {
              console.log("Error on publishing message to topic Facebook");
              console.log(err);
            } else {
              console.log("Message published to Facebook SNS topic successfully")
              console.log(data);
            }
          });
        }
       }
       catch (e){
         console.log('Error processing listen notification from database\n'+e);
       }
     });
     // Initiate the listen query
     client.query("LISTEN watchers");
  });
})
