import {cassandraclient} from './modules/cassandraclient'
import {logger} from './modules/logger'
const TimeUuid = require('cassandra-driver').types.TimeUuid;
const ytScraper = require("yt-scraper")
const axios = require('axios')
const cio = require('cheerio-without-node-native');
import * as youtubei from "youtubei";
const editJsonFile = require("edit-json-file");
const youtube = new youtubei.Client();
var importconfigfile = editJsonFile(`${__dirname}/../removedytvids.json`);
const Long = require('cassandra-driver').types.Long;
const CloudflareBypasser = require('cloudflare-bypasser');
 
let cf = new CloudflareBypasser();
 

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

        //add paint the town to the list of default videos
   // await addVideoToTrackList("_EEo-iE5u_A",undefined)
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
    }).catch(error => console.error(error));
    logger.discordDebugLogger.debug(`videoid ${statParams.videoid} ${statParams.views} views ${statParams.likes} likes ${statParams.dislikes} dislikes`, {type: "videoStatsAddToDatabase"})
}

export async function fetchStatsForAll() {

    var queryFetchAllTrackedIds = "SELECT * FROM adorastats.trackedytvideosids"
    cassandraclient.stream(queryFetchAllTrackedIds)
  .on('readable',async function () {
    // readable is emitted as soon a row is received and parsed
    let row;
    while (row = this.read()) {
        try {
      // process row
       // logger.discordInfoLogger.info(row.videoid + ' in the database')
        const video = await youtube.getVideo(row.videoid)
        console.log(`Video: ${video.title} has ${video.viewCount} views`)

        var loadedRemovedData = importconfigfile.get()

        if (loadedRemovedData.removedvids.indexOf(row.videoid) == -1) {
            const video = await youtube.getVideo(row.videoid)
            console.log(`Video: ${video.title} has ${video.viewCount} views`)

            if (loadedRemovedData.removedvids.indexOf(row.videoid) == -1 && 
            loadedRemovedData.removedytchannels.indexOf(video.channel.id) == -1) {
              // addStatsToYtVideo(row.videoid,video.viewCount,video.likeCount,video.dislikeCount,undefined)
                addStatsToYtVideo({
                    videoid: row.videoid,
                    views: video.viewCount,
                    likes: video.likeCount,
                    dislikes: video.dislikeCount,
                    comments: undefined
                })
            }
        }

        // loadedRemovedData = importconfigfile.get()

    }
    catch {
        
    }
}
  })
  .on('end', function () {
    // emitted when all rows have been retrieved and read
    logger.discordInfoLogger.info("all tracked youtube videos finished reading")
  });
}
// look up list of known songs

//fetch for each song

// insert views, likes, dislike counts into database

