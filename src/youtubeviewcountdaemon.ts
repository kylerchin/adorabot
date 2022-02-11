import {cassandraclient} from './modules/cassandraclient'
import {logger} from './modules/logger'
const TimeUuid = require('cassandra-driver').types.TimeUuid;
const editJsonFile = require("edit-json-file");
import { Client } from "youtubei";
const requestjson = require('request-json');

const youtube = new Client();

const axios = require('axios');
var importconfigfile = editJsonFile(`${__dirname}/../removedytvids.json`);
var authconfigfile = editJsonFile(`${__dirname}/../config.json`);
const Long = require('cassandra-driver').types.Long;

export async function createDatabases() {

    //This Function will automatically create the adorastats keyspace if it doesn't exist, otherwise, carry on
    await cassandraclient.execute("CREATE KEYSPACE IF NOT EXISTS adorastats WITH REPLICATION = { 'class' : 'NetworkTopologyStrategy',  'datacenter1': 1  };")
        .then(async result => {
            await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
            /*console.log(result)*/
        }).catch(error => console.error(error));

    //Goes inside adora moderation keyspace, makes the table "trackedytvideoids"
    await cassandraclient.execute("CREATE TABLE IF NOT EXISTS adorastats.trackedytvideosids (videoid text PRIMARY KEY, added timeuuid, videoname text);")
        .then(async result => {
            await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
            /*console.log(result)*/
        }).catch(error => console.error(error));

    //Goes inside adorastats keyspace, makes the table "ytvideostats"
    await cassandraclient.execute("CREATE TABLE IF NOT EXISTS adorastats.ytvideostats (videoid text, time timeuuid, views bigint, likes bigint, dislikes bigint, comments bigint, PRIMARY KEY (videoid, time));")
        .then(async result => {
            await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
        }).catch(error => console.error(error));
    
    await cassandraclient.execute("CREATE TABLE IF NOT EXISTS adorastats.statpoints (source text PRIMARY KEY, amount counter)")
    .then(async result => {
        await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
    }).catch(error => console.error(error));

        //add paint the town to the list of default videos
   // await addVideoToTrackList("_EEo-iE5u_A",undefined)
}

export async function addstatpointcount(source) {
    var query = "UPDATE adorastats.statpoints SET amount = amount + 1 WHERE source = ?;"
    var params = [source]
    await cassandraclient.execute(query, params, {prepare: true})
    .then(async result => {
        await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
    }).catch(error => console.error(error));
}

export async function addVideoToTrackList(videoid,name) {
    var query = "INSERT INTO adorastats.trackedytvideosids (videoid, added, videoname) VALUES (?,?,?)"
    var params = [videoid, TimeUuid.now(),name]
    await cassandraclient.execute(query, params)
    .then(async result => {
        await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
    }).catch(error => console.error(error));
}

export function longOrEmpty(number) {
    return ((number === null || number === undefined || number === NaN) ? undefined : Long.fromNumber(number))
}

interface statInterface {
    videoid: string;
    time? : Date;
    views: number | undefined;
    likes: number | undefined;
    dislikes: number | undefined;
    comments: number | undefined;
}

export async function addStatsToYtVideo(statParams: statInterface) {
    var query = "INSERT INTO adorastats.ytvideostats (videoid, time, views, likes, dislikes, comments) VALUES (?,?,?,?,?,?)"
    
    var commentsLong = longOrEmpty(statParams.comments)
    
    var timeUuid;

    if (statParams.time) {
        timeUuid = TimeUuid.fromDate(statParams.time)
    } else {
        timeUuid = TimeUuid.now()
    }

    var params = [statParams.videoid, 
        timeUuid,
        longOrEmpty(statParams.views),
        longOrEmpty(statParams.likes),
        longOrEmpty(statParams.dislikes),
        commentsLong]
    await cassandraclient.execute(query, params, {prepare: true})
    .then(async result => {
        await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
        logger.discordDebugLogger.debug(`videoid ${statParams.videoid} ${statParams.views} views ${statParams.likes} likes ${statParams.dislikes} dislikes`, { type: "videoStatsAddToDatabase" })
        try {
            addstatpointcount("youtube") 
        }
        catch (pointcounterr) {
            console.log(pointcounterr)
        }
        return true;
    }).catch(error => {
        console.error(error)
        return error
    });
   
}

export async function fetchStatsForAll() {

    var loadedRemovedData = importconfigfile.get()
    var loadedAuthData = authconfigfile.get()

    var queryFetchAllTrackedIds = "SELECT * FROM adorastats.trackedytvideosids"

    cassandraclient.execute(queryFetchAllTrackedIds)
        .then((result) => { 
            console.log('recieved all tracked yt videos')
            result.rows.forEach(async (row) => {
                console.log(row)
                // process row
                // logger.discordInfoLogger.info(row.videoid + ' in the database')
              //  console.log('get video try')

                if (loadedRemovedData.removedvids.indexOf(row.videoid) == -1) {

                    if (loadedAuthData.config.youtubeApiKeysDaemon) {

                        var apikeysdaemonarray = loadedAuthData.config.youtubeApiKeysDaemon

                        var theRandomApiKey =  apikeysdaemonarray[Math.floor(Math.random()*apikeysdaemonarray.length)];

                        const firstPartOfPath = "https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=" 

                        const pathForYtRequest = firstPartOfPath + row.videoid + "&key=" + theRandomApiKey

                        var youtubeclient = requestjson.createClient('https://youtube.googleapis.com/');

                        youtubeclient.get(pathForYtRequest, async function(err, res, body) {

                            console.log(body)

                            if (!err) {
                                
                            const timeOfRequest = new Date();

                            if (body.items) {

                                if (body.items.length > 0) {
                                    const videostats = body.items[0].statistics;
                                    
                                    if (videostats.viewCount) {
                                        await  addStatsToYtVideo({
                                            videoid: body.items[0].id,
                                            views: videostats.viewCount,
                                            likes: videostats.likeCount,
                                            dislikes: videostats.likeCount,
                                            comments: videostats.commentCount
                                        })
                                    }
                                }
                                
                          
                            }
                            }

                        })
                    }

                    var fullUrlOfVideo = `https://www.youtube.com/watch?v=${row.videoid}`


                    try {

                  
                        if (false) {
                            let { data } = await axios.get(fullUrlOfVideo);

                            //logger.discordInfoLogger.info(data, {type: 'youtubeHtmlRespond'})
                           // var viewCount = parseInt(data.match(/<meta itemprop="interactionCount" content="[^"]">/g)[0],10)
                           var viewCount = parseInt(data.match(/<meta itemprop="interactionCount" content="([^">]*)">/g)[0].replace(/<meta itemprop="interactionCount" content="/g,"").replace(/">/,""),10)
                    
                           var likedisliketooltipMatches = data.match(/"tooltip":"(\d||,)+ \/ (\d||,)+"/g)
                    
                           //delete the webpage since we dont need it anymore
                           data = null;
                    
                           console.log('likeddisliketooltipmatches', likedisliketooltipMatches)
                    
                           if (likedisliketooltipMatches && (likedisliketooltipMatches !== null)) {
                            var likedisliketooltip = likedisliketooltipMatches[0].replace(/"tooltip": ?"/g,"").replace(/"/g,"")
                    
                            var likeanddislikearray = likedisliketooltip.split("/");
                     
                            console.log('splittedArray', likeanddislikearray)
                     
                            console.log("likeCountAttempt",likeanddislikearray[0])
                            var likeCount = parseInt(likeanddislikearray[0].trim().replace(/,/g,""),10)
                     
                            var dislikeCount = parseInt(likeanddislikearray[1].trim().replace(/,/g,""),10)
                     
                             console.log(viewCount)
                             console.log("likeCount",likeCount)
                             console.log("dislikeCount",dislikeCount)
                                         await  addStatsToYtVideo({
                                             videoid: row.videoid,
                                             views: viewCount,
                                             likes: likeCount,
                                             dislikes: dislikeCount,
                                             comments: undefined
                                         })
                           }
                    
                         
                        }
       
                   
                } catch (erroraxios) {
                    console.log(erroraxios)
                }
            } 

            //nullify row
            row = null;
            })

            //nullify all the extra data
            result = null;
        }).catch((error) => { console.log(error) })
    // look up list of known songs

    //fetch for each song

    // insert views, likes, dislike counts into database
}