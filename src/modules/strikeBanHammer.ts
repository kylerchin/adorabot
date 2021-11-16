import { logger } from './logger'
import { cassandraclient } from './cassandraclient'
import editJsonFile = require("edit-json-file");
import {isServerBanNotRateLimited} from './isserverratelimited'
let fileOfBanTimeouts = editJsonFile(`${__dirname}/../../putgetbanstimeout.json`);

interface optionsInterface {
    individualservertodoeachban: any,
    eachBannableUserRow: any,
    unknownuserlocalarray: any,
    toBanReason: any
}

export async function strikeBanHammer(options: optionsInterface) {


    var {individualservertodoeachban, eachBannableUserRow, unknownuserlocalarray, toBanReason} = options
    if (isServerBanNotRateLimited(options.individualservertodoeachban.id)) {
        var isNotLimitedByNonMemberBanLimit = false;
        await cassandraclient.execute("SELECT * FROM adoramoderation.nonmemberbanlimit WHERE guildid = ?",[individualservertodoeachban.id])
        .then((resultsOfNonMemberBanLimit) => {
            if (resultsOfNonMemberBanLimit.rows.length === 0) {
                isNotLimitedByNonMemberBanLimit = false
            } else {
                var timeOfLimit = parseInt(resultsOfNonMemberBanLimit.rows[0].time.toString(),10)

                isNotLimitedByNonMemberBanLimit = (timeOfLimit + 3600 < Date.now())
            }
        })

        if (isNotLimitedByNonMemberBanLimit) {
            await individualservertodoeachban.members.ban(eachBannableUserRow.banneduserid, { 'reason': toBanReason })
            .then(async (user) => {
                console.log(`Banned ${user.username || user.id || user} from ${individualservertodoeachban.name} for ${toBanReason}`)
                await cassandraclient.execute("INSERT INTO adoramoderation.completedbans (guildid, userid, timeofban) VALUES (?,?,?) IF NOT EXISTS;",
                [ individualservertodoeachban.id,eachBannableUserRow.banneduserid,Date.now()],
                {prepare:true})
                .catch((error) => {console.log(error)})
                
                await logger.discordDebugLogger.debug(`Banned ${user.username || user.id || user} from ${individualservertodoeachban.name} for ${toBanReason}`, { userObject: user, banReason: toBanReason, individualservertodoeachban: individualservertodoeachban, type: "recheckBansAddBanSuccessful" })
            })
            .catch(async (error) => {
        
                await logger.discordWarnLogger.warn({
                    type: "banCheckerFailed",
                    error: error
                })
         
                if (error.code === 30035) {
                    //non member bans exceeded, time window like 24 hrs
    
                    // avoid getting shut down, stop banning
    
                    await cassandraclient.execute("INSERT INTO adoramoderation.nonmemberbanlimit (guildid, time) VALUES (?,?)",
                    [individualservertodoeachban.id,Date.now()],
                    {prepare:true})
                    .catch((cassandraerror4) => console.error(cassandraerror4))
                }
    
                if (error.code === 10013) {
                    //this user is unknown
                    unknownuserlocalarray.push(eachBannableUserRow.banneduserid)
                    //push data to cassandra
                    var queryForUnknownUser = "INSERT INTO adoramoderation.banneduserlist (banneduserid, banned, reason, lastchangedbyid, lastchangedtime, firstchangedbyid, firstchangedtime, unknownuser) VALUES (?, ?, ?, ?, ?, ?, ?, ?);"
                    var paramsForUnknownUser = [eachBannableUserRow.banneduserid,
                    eachBannableUserRow.banned,
                    eachBannableUserRow.reason,
                    eachBannableUserRow.lastchangedbyid,
                    eachBannableUserRow.lastchangedtime,
                    eachBannableUserRow.firstchangedbyid,
                    eachBannableUserRow.firstchangedtime,
                        true]
                    await cassandraclient.execute(queryForUnknownUser, paramsForUnknownUser)
                        .then(async (cassandrclientmarkunknown) => {
                            logger.discordDebugLogger.debug(`Marked ${eachBannableUserRow.banneduserid} as unknown`, { type: cassandraclient, result: cassandrclientmarkunknown })
                        })
                        .catch();
                }
            });
        }
       
    }
 
}