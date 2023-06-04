
import {cassandraclient} from './modules/cassandraclient'
import {logger} from './modules/logger'
const TimeUuid = require('cassandra-driver').types.TimeUuid;
const editJsonFile = require("edit-json-file");
import { Client } from "youtubei";
const requestjson = require('request-json');
import {simpleHash} from './modules/simplehash'
import {dogstatsd} from './modules/dogstats';

import { uploadStringToNewRelic } from './modules/newRelic';

const importconfigfile = editJsonFile(`${__dirname}/../removedytvids.json`);
const authconfigfile = editJsonFile(`${__dirname}/../config.json`);

const loadedRemovedData = importconfigfile.get()
const loadedAuthData = authconfigfile.get()

const Long = require('cassandra-driver').types.Long;

function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

export async function fetchVideo(pathForYtRequest) {
  var startingTime = Date.now()

  dogstatsd.increment('adorastats.attemptfetch');
    fetch(pathForYtRequest)
    .then((response) => response.json())
    .then(async(body) => {

       

        var timeItTook = Date.now() - startingTime;

      //  await dogstatsd.increment('adorabot.triggerprefix');

      dogstatsd.increment('adorastats.fetchedvideo');
     

           // Histogram: send data for histogram stat (DataDog and Telegraf only)
  dogstatsd.histogram('adorastats.fetchvideohisto', timeItTook);

  // Distribution: Tracks the statistical distribution of a set of values across your infrastructure.
  // (DataDog v6)
  dogstatsd.distribution('adorastats.fetchvideodist', timeItTook);

//        console.log(body)

        var success = false;

       
            
        const timeOfRequest = new Date();

        if (body.items) {

            if (body.items.length > 0) {
                const videostats = body.items[0].statistics;
                
                if (videostats.viewCount) {
                    success = true;

                    dogstatsd.increment('adorastats.fetchedvideosuccess');
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

        if (success === false) {
            console.log(body);

            dogstatsd.increment('adorastats.nostats');

            uploadStringToNewRelic(JSON.stringify({
                type: "ytfetcherror",
                body: body,
                keyused: pathForYtRequest
            }));
        }

       

    })
    .catch((err) => {
        console.error(err);

        dogstatsd.increment('adorastats.noresponseaxios');

        uploadStringToNewRelic(JSON.stringify({
            type: "ytfetcherror",
            err: err,
            keyused: pathForYtRequest
        }));
    });
}

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
    return ((number === null || number === undefined || Number.isNaN(number)) ? undefined : Long.fromNumber(number))
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

interface fetchAllInterface {
    runAll: boolean;
    currentSegment?: Number;
    stagger?: boolean;
}

export async function fetchStatsForAll(inputObj:fetchAllInterface) {

    var queryFetchAllTrackedIds = "SELECT * FROM adorastats.trackedytvideosids"

    cassandraclient.execute(queryFetchAllTrackedIds)
        .then((result) => { 

            try {
                dogstatsd.gauge("adorastats.rowsfromtrackinglist", result.rows.length);
            } catch (datadogfailed) {
                console.error(datadogfailed);
            }

            console.log('recieved all tracked yt videos')
            result.rows.forEach(async (row) => {
              //  console.log(row)
                // process row
                // logger.discordInfoLogger.info(row.videoid + ' in the database')
              //  console.log('get video try')

                var shouldRun = inputObj.runAll;

                if (shouldRun === false) {
                    var thisVideoSectionNumber;

                    var firstCharacterHash = simpleHash(row.videoid).substring(0, 1)

                    console.log('firstCharacterHash', firstCharacterHash)

                    if (firstCharacterHash.match(/[0-7]/g)) {

                        console.log('matches first hash 0')
                        thisVideoSectionNumber = 0;
                    } else {
                        console.log('matches first hash 1')
                        thisVideoSectionNumber = 1;
                    }

                    if (thisVideoSectionNumber == inputObj.currentSegment) {
                        console.log('matching input hash of ', inputObj.currentSegment)
                        shouldRun = true;
                    } else {
                        console.log(thisVideoSectionNumber + 'not matching input hash of ', inputObj.currentSegment)
                    }

                    if (shouldRun === false) {
                        if (row.added) {
                            var currentTime = row.added.getDate().getTime();

                            if (currentTime) {
                                if (currentTime > (Date.now() - (86400 * 1000 * 3))) {

                                    shouldRun = true;
    
                                }
                            }
                        }
                    }
                }

                if (shouldRun === true) {
                    if (loadedRemovedData.removedvids.indexOf(row.videoid) == -1) {

                        if (loadedAuthData.config.youtubeApiKeysDaemon) {
    
                            var apikeysdaemonarray = loadedAuthData.config.youtubeApiKeysDaemon
    
                            var theRandomApiKey =  apikeysdaemonarray[Math.floor(Math.random()*apikeysdaemonarray.length)];
    
                            const firstPartOfPath = "https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=" 
    
                            const pathForYtRequest = firstPartOfPath + row.videoid + "&key=" + theRandomApiKey
    
                            if (inputObj.stagger === true) {

                                setTimeout(() => {
                                    fetchVideo(pathForYtRequest);
                                }, randomIntFromInterval(1, 100000));
                            } else {
                                fetchVideo(pathForYtRequest);
                            }
                           
                           
                        }
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
