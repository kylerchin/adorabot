const express = require('express');
var fs = require('fs')
const app = express();
const { config } = require('./../config.json');
const cassandra = require('cassandra-driver');

const TimeUuid = require('cassandra-driver').types.TimeUuid;

const Topgg = require("@top-gg/sdk")

import { assignWith } from 'lodash';
import {logger,tracer,span} from './modules/logger'

// Parse JSON bodies for this app. Make sure you put
// `app.use(express.json())` **before** your route handlers!
app.use(express.json());

const https = require('https');
const http = require('http');
const webhook = new Topgg.Webhook(config.topgg.auth)

async function createDatabases() {
    await cassandraclient.execute("CREATE KEYSPACE IF NOT EXISTS adoravotes WITH REPLICATION = { 'class' : 'NetworkTopologyStrategy',  'datacenter1': 1  };")
    .then(async result => {
        await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
        /*console.log(result)*/
    }).catch(error => console.error(error));

     //Goes inside adoravotes keyspace, makes the table "votes"
     await cassandraclient.execute("CREATE TABLE IF NOT EXISTS adoravotes.votes (time timeuuid PRIMARY KEY, voteservice text, userid text);")
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

 // res.write('<link href="https://fonts.googleapis.com/css?family=Roboto Condensed" rel="stylesheet"> <style> body {font-family: "Roboto Condensed";font-size: 22px;} </style><p>Hosting Active</p>');

  //res.end();
  res.status(200).send('okay');
});

app.all('/discordbotlist',async (req, res) => {
    res.setHeader('Content-Type', 'text/html');
  
    console.log(req)

    console.log(req.body)


  // Grab the "Authorization" header.
  var auth = req.get("authorization");

  // On the first request, the "Authorization" header won't exist, so we'll set a Response
  // header that prompts the browser to ask for a username and password.
  if (!auth) {
    res.set("WWW-Authenticate", "Basic realm=\"Authorization Required\"");
    // If the user cancels the dialog, or enters the password wrong too many times,
    // show the Access Restricted error message.
    return res.status(401).send("Authorization Required");
  } else {
      console.log(auth)
    if(auth === config.discordbotlist.auth) {
        console.log("authenticated")

    const reqjson = req.body;
    logger.discordInfoLogger(reqjson, {type: "discordbotlistvotewebhook"})

    const query = 'INSERT INTO adoravotes.votes (time, voteservice, userid) VALUES (?, ?, ?)';
    var params;
        params = [TimeUuid.now(), "discordbotlist", reqjson.id];
  
    await cassandraclient.execute(query, params, { prepare: true }, await function (err) {
        console.log(err);
        //Inserted in the cluster
        //logger.discordInfoLogger.info("Inserted Vote from Top.gg into database", {"type": "VoteWebhookDatabase"})
    });
        		//https://api.adora.yk3music.com:3000/discordbotlist
          
    res.write('OK');
  
    res.end();
    }
  }

  });

app.all('/topgg', webhook.listener(async (vote) => {
    // vote will be your vote object, e.g
    console.log(vote.user) // 395526710101278721 < user who voted\

    const query = 'INSERT INTO adoravotes.votes (time, voteservice, userid) VALUES (?, ?, ?)';
    var params;
        params = [TimeUuid.now(), "topgg", vote.user];

    console.log(vote)
  
    await cassandraclient.execute(query, params, { prepare: true }, await function (err) {
        console.log(err);
        //Inserted in the cluster
        logger.discordInfoLogger.info("Inserted Vote from Top.gg into database", {"type": "VoteWebhookDatabase"})
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