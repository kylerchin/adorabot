const express = require('express');
var fs = require('fs')
const app = express();
const { config } = require('./../config.json');
const cassandra = require('cassandra-driver');

const TimeUuid = require('cassandra-driver').types.TimeUuid;

const Topgg = require("@top-gg/sdk")

const https = require('https');
const http = require('http');
const webhook = new Topgg.Webhook(config.topgg.auth)

import {logger} from './modules/logger'

async function createDatabases() {
    await cassandraclient.execute("CREATE KEYSPACE IF NOT EXISTS adoravotes WITH REPLICATION = { 'class' : 'NetworkTopologyStrategy',  'datacenter1': 1  };")
    .then(async result => {
        await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
        /*console.log(result)*/
    }).catch(error => console.error(error));

     //Goes inside adoravotes keyspace, makes the table "votes"
     await cassandraclient.execute("CREATE TABLE IF NOT EXISTS adoravotes.votes (time timeuuid PRIMARY KEY, voteservice string, userid text);")
     .then(async result => {
         await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
         /*console.log(result)*/
     }).catch(error => console.error(error));

}

const cassandraclient = new cassandra.Client({
  contactPoints: config.cassandra.contactPoints,
  localDataCenter: config.cassandra.localDataCenter,
  authProvider: new cassandra.auth
   .PlainTextAuthProvider(config.cassandra.plainTextUsername, config.cassandra.plainTextPassword)
});

const cors = require('cors');

// Automatically allow cross-origin requests
app.use(cors({ origin: true }));

createDatabases()

app.all('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');

  console.log(req.body)

  res.write('<link href="https://fonts.googleapis.com/css?family=Roboto Condensed" rel="stylesheet"> <style> body {font-family: "Roboto Condensed";font-size: 22px;} </style><p>Hosting Active</p>');

  res.end();
});

app.all('/topgg', webhook.listener(async (vote) => {
    // vote will be your vote object, e.g
    console.log(vote.user) // 395526710101278721 < user who voted\

    const query = 'INSERT INTO adoravotes.votes (time, voteservice, userid) VALUES (?, ?, ?)';
    var params;
        params = [TimeUuid.now(), "topgg", 'vote.user'];

    console.log(vote)
  
    await cassandraclient.execute(query, params, { prepare: true }, await function (err) {
        console.log(err);
        //Inserted in the cluster
        logger.discordInfoLogger("Inserted Vote from Top.gg into database", {"type": "VoteWebhookDatabase"})
    });

    // You can also throw an error to the listener callback in order to resend the webhook after a few seconds
  }));

export function keepAlive() {
    // Listen both http & https ports
const httpServer = http.createServer(app);
const httpsServer = https.createServer({
  key: fs.readFileSync(`${__dirname}/../certs/live/api.adora.yk3music.com/privkey.pem`),
  cert: fs.readFileSync(`${__dirname}/../certs/live/api.adora.yk3music.com/fullchain.pem`),
}, app);

/*httpServer.listen(2999, () => {
    console.log('HTTP Server running on port 80');
});*/

httpsServer.listen(3000, () => {
    console.log('HTTPS Server running on port 3000');
});
}