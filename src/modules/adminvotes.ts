 //also allow adorabot admins to change this
 var isauthorizedtoaddbanstodatabase: boolean = false;


 const TimeUuid = require('cassandra-driver').types.TimeUuid;
const editJsonFile = require("edit-json-file");
import {Message} from 'discord.js'
var forEach = require("for-each")

import {addNewVote} from './../server'

var importconfigfile = editJsonFile(`${__dirname}/../../config.json`);

 /*  console.log(loadedConfigData) */

 interface manualVoteArgs {
     message: Message;
     args: any;
     [key: string]: any;
 }

export function manuallyAddVote(manualVoteArgs) {

    var isauthorizedtoaddbanstodatabase: boolean = false;

 var loadedConfigData = importconfigfile.get()

 forEach(loadedConfigData.config.allowedToBanUsers, function (value, key, array) {
     if (value.userid === manualVoteArgs.message.author.id) {
         isauthorizedtoaddbanstodatabase = true;
         return true;
     } else {

     }
 });

 if ( isauthorizedtoaddbanstodatabase) {
     manualVoteArgs.message.reply("authorized")
     var userIdAdd = manualVoteArgs.args[0]
     var serviceAdd = manualVoteArgs.args[1]
     addNewVote(userIdAdd,serviceAdd)
     manualVoteArgs.message.reply(`added 1 vote manually ${userIdAdd} from service ${serviceAdd}`)
 }

 
}
