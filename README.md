# cognicity-notification-service
This service listens in on Postgres notifications and pushes confirmation response to SNS topics based on Source network type

### Install
`npm install`

### Run
`node app.js`

### Configuration
Save a copy of sample.env as .env in local directory with appropriate credentials
* `MAP`: Riskmap's Map URL
* `ACCOUNTID`: AWS Account ID
* `AWS_REGION`: AWS Region where SNS topics were created
* `PG_CON`: Postgres database connection string

#### Misc Notes
- AWS credentials are stored in bash_profile
- Grasp "username" is userID/senderID from source networks to allow replies in conversation
- Errors are logged to console, but not returned to user currently
