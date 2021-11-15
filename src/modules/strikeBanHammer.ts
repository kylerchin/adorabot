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
    if (isServerBanNotRateLimited(options.individualservertodoeachban.id)) {
        var {individualservertodoeachban, eachBannableUserRow, unknownuserlocalarray, toBanReason} = options
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