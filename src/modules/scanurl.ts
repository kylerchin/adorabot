import { uniq } from './util'
const { canonicalize, getPrefixes, suffixPostfixExpressions } = require('webrisk-hash');
import { logger } from './logger'
import { Util } from 'discord.js'
var forEach = require("for-each")
const TimeUuid = require('cassandra-driver').types.TimeUuid;
const cassandra = require('cassandra-driver');
const { config } = require('./../../config.json');
import { cassandraclient } from './cassandraclient'
import { result } from 'lodash';
import { ActionRowBuilder } from 'slash-commands';
import * as _ from 'lodash'
const { weirdToNormalChars } = require('weird-to-normal-chars');

function urlDecodeSafe(path) {
    try {
        return decodeURIComponent(path);
    } catch (e) {
        return ''
    }
}

export async function createUrlDatabase() {
    //Goes inside adora moderation keyspace, makes the table "guildssubscribedtoautoban"
    await cassandraclient.execute("CREATE TABLE IF NOT EXISTS adoramoderation.badlinks (link text PRIMARY KEY, type text, addedbyid text, addtime timeuuid);")
        .then(async result => {
            await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
            /*console.log(result)*/
        }).catch(error => console.error(error));
}

export function allPossibleUrls(stringToProcess) {

    if (stringToProcess) {

        var listOfAdaptedStrings = [stringToProcess,
            stringToProcess.replace(/\*/gm, ''),
            stringToProcess.replace(/\*\*\*/gm, ''),
            stringToProcess.replace(/\*\*/gm, ''),
            stringToProcess.replace(/\n/gm, ''),
            stringToProcess.replace(/\~/gm, ''),
            stringToProcess.replace(/\`/gm, ''),
            stringToProcess.replace(/\`/gm, '').replace(/\n/gm, ''),
            stringToProcess.replace(/\`/gm, '').replace(/\n/gm, ''),
            stringToProcess.replace(/>/gm, '').replace(/\n/gm, ''),
            stringToProcess.replace(/\_\_/gm, ''),
            stringToProcess.replace(/\_/gm, ''),
            stringToProcess.replace(/\$/gm, ''),
            Util.escapeBold(stringToProcess),
            Util.escapeMarkdown(stringToProcess),
            Util.escapeInlineCode(stringToProcess),
            Util.escapeSpoiler(stringToProcess),
            Util.escapeStrikethrough(stringToProcess),
            Util.escapeCodeBlock(stringToProcess),
            Util.escapeCodeBlock(Util.escapeCodeBlock(stringToProcess)),
            Util.escapeUnderline(stringToProcess),
            stringToProcess.replace(/\|/gm, ''),
            stringToProcess.replace(/\|/gm, '').replace(/\n/gm, ''),
            urlDecodeSafe(stringToProcess)
        ];

        var listOfNormalizedStrings = listOfAdaptedStrings.map((eachString) => {
            return weirdToNormalChars(eachString);
        })

        var totalCombinedStrings = _.union([listOfNormalizedStrings, listOfAdaptedStrings])

        return totalCombinedStrings;
    } else {
        return ''
    }

}

export function allPossibleUrlsArray(arrayOfStrings) {
    var arrayOfStringsToRet: any = []

    arrayOfStrings.forEach((eachString) => {
        var stringReturned = allPossibleUrls(eachString)

        var stringReturnedNormalized = allPossibleUrls(weirdToNormalChars(eachString));

        arrayOfStringsToRet = _.union([arrayOfStrings, stringReturned, stringReturnedNormalized])
    })

    return _.uniq(arrayOfStrings);
}



export async function processmalwarediscordmessage(message) {
    //  console.log('func called')
    try {
        if (message.content) {
            //   console.log('message.content', message.content)
            var arrayOfStarting = allPossibleUrlsArray([message.content, message.cleanContent])

            var arrayOfStartingUniq = _.uniq(arrayOfStarting)

            //   logger.discordDebugLogger.debug({type: 'arrayOfStarting', array: arrayOfStarting})
            //  console.log('arrayOfStarting', arrayOfStarting)

            var arrayOfUrls = []

            arrayOfStartingUniq.forEach((eachString: any) => {
                var arrayOfItemsToAdd = _.uniq(eachString.match(/(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/gm));

                arrayOfUrls = _.union([arrayOfUrls, arrayOfItemsToAdd])
            })

            var arrayOfUrls = _.union(_.uniq(arrayOfUrls))

            // arrayOfUrls = uniq(arrayOfUrls)
            // console.log("arrayOfUrls", arrayOfUrls)
            //console.log("typeof arrayOfUrls", typeof arrayOfUrls)

            if (arrayOfUrls === null) {

            } else {
                if (arrayOfUrls.length > 0) {
                    //  console.log(arrayOfUrls)
                    var isBadMessage: Boolean = false;
                    var hasBeenAlerted = false;

                    var joinFacts = _.flatten(arrayOfUrls.filter((eachItem) => eachItem != []))

                    //  console.log(joinFacts)

                    if (joinFacts.length > 0) {
                        var arrayOfSetsOfLinksInit = joinFacts
                            .filter((eachLink) => eachLink !== null)
                            .filter((eachLink) => eachLink != undefined)
                            .filter((eachLink) => typeof eachLink === 'string')
                            .map(link => suffixPostfixExpressions(canonicalize(link))).filter((eachLink) => eachLink !== null)

                        arrayOfSetsOfLinksInit.forEach((eachSet) => {
                            eachSet.forEach((possibleLink) => {
                                var queryLink = "SELECT * FROM adoramoderation.badlinks WHERE link = ?";
                                var possibleLinkNoProtocol = possibleLink.replace(/https:\/\//, "").replace(/http:\/\//, "")

                                // message.reply(possibleLinkNoProtocol)

                                var paramsLink = [possibleLinkNoProtocol]

                                cassandraclient.execute(queryLink, paramsLink).then(async (resultOfLinkCheck) => {
                                    if (resultOfLinkCheck.rows.length === 0) {
                                        //safe
                                        //console.log("url safe")
                                    } else {
                                        //ALERT
                                        isBadMessage = true;

                                        if (hasBeenAlerted === false) {
                                            hasBeenAlerted = true;
                                            await Promise.all([
                                                message.react('⚠️'),
                                                message.reply({
                                                    "embeds": [{
                                                        "title": ":warning: Warning! This is a dangerous link that can hack your discord account! :warning: ",
                                                        "description": "The link above is a Discord Login link, which if clicked, can allow an attacker to login and take over your account. Often scammers will pretend the links / qr codes are free nitro or other gifts. DO NOT CLICK IT!"
                                                    }]
                                                }).catch((error) => undefined)
                                            ]).catch(error => undefined)
                                        }

                                        logger.discordInfoLogger.info({
                                            type: "alertbadurladora",
                                            message: resultOfLinkCheck.rows[0].link,
                                            threat: resultOfLinkCheck.rows[0].type,
                                            messageSenderTag: message.author.tag
                                        })

                                    }
                                }).catch((hashcheckerror) => {
                                    logger.discordErrorLogger.error({ type: "checkbadurlfail", message: hashcheckerror })
                                })
                            })
                        })





                        var cleanedArrayOfHashes = arrayOfUrls
                            .filter(eachUrl => typeof eachUrl === 'string')
                            .map(eachUrl => {
                                var prefix = getPrefixes(eachUrl)

                                // console.log("prefix", prefix)

                                var prefixArray: Array<any> = Array.from(prefix);

                                //   console.log("prefixArray", prefixArray)

                                var base64String = prefixArray.map(eachprefix => Buffer.from(eachprefix).toString('base64'))

                                return base64String
                            })

                        //          console.log('cleanedArrayOfHashes', cleanedArrayOfHashes)

                        //            console.log("before each url for each")

                        //each url has several hashes
                        forEach(cleanedArrayOfHashes, function (hashesForOneUrl, index) {
                            var currentUrl = arrayOfUrls[index]

                            //   console.log("before each hash for each")

                            //for each hash in 1 url at a time

                            forEach(hashesForOneUrl, function (eachHash, indexOfHash) {
                                var queryHash = "SELECT * FROM adorasafebrowsing.threatprefixes WHERE prefix = ?"

                                var paramsHash = [eachHash.substring(0, 4)]

                                // console.log("paramsHash", paramsHash)
                                cassandraclient.execute(queryHash, paramsHash).then((resultOfHashCheck) => {
                                    if (resultOfHashCheck.rows.length === 0) {
                                        //safe
                                        //console.log("url safe")
                                    } else {
                                        //ALERT

                                        logger.discordInfoLogger.info({
                                            type: "alertbadurl",
                                            message: currentUrl,
                                            threat: resultOfHashCheck.rows[0].threat
                                        })

                                    }
                                }).catch((hashcheckerror) => {
                                    logger.discordErrorLogger.error({ type: "checkbadurlfail", message: hashcheckerror })
                                })
                            })

                        })

                        //        logger.discordInfoLogger.info({type: "links", message: cleanedArrayOfHashes, links: arrayOfUrls})
                    }


                }
            }

        }

    }
    catch (processmalware) {
        console.error(processmalware)
    }

}