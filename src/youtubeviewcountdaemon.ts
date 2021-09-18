import {cassandraclient} from './modules/cassandraclient'
import {logger} from './modules/logger'
const TimeUuid = require('cassandra-driver').types.TimeUuid;
const ytScraper = require("yt-scraper")
const axios = require('axios')
const cio = require('cheerio-without-node-native');
import * as youtubei from "youtubei";
const youtube = new youtubei.Client();

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

export async function addStatsToYtVideo(videoid,views,likes,dislikes,comments) {
    var query = "INSERT INTO adorastats.ytvideostats (videoid, time, views, likes, dislikes, comments) VALUES (?,?,?,?,?,?)"
    var params = [videoid, TimeUuid.now(),views,likes,dislikes,comments]
    await cassandraclient.execute(query, params)
    .then(async result => {
        await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
    }).catch(error => console.error(error));
    logger.discordDebugLogger.debug(`videoid ${videoid} ${views} views ${likes} likes ${dislikes} dislikes`, {type: "videoStatsAddToDatabase"})
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


        //var videoResult = await ytScraper.video('row.videoid')
        const video = await youtube.getVideo(row.videoid)
        console.log(`Video: ${video.title} has ${video.viewCount} views`)
        addStatsToYtVideo(row.videoid,video.viewCount,video.likeCount,video.dislikeCount,undefined)
        //Cherio inerpretation of HTML contents
       // const $ = cio.load(data);
        //find lyrics inside div element, trim off whitespace
        //let lyrics = $('div[class="lyrics"]').text().trim();
       // sleep(1000)
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

