import {cassandraclient} from './modules/cassandraclient'
import {logger} from './modules/logger'
const TimeUuid = require('cassandra-driver').types.TimeUuid;
const ytScraper = require("yt-scraper")
const axios = require('axios')
const cio = require('cheerio-without-node-native');

export async function createDatabases() {
    //This Function will automatically create the adorastats keyspace if it doesn't exist, otherwise, carry on
    await cassandraclient.execute("CREATE KEYSPACE IF NOT EXISTS adorastats WITH REPLICATION = { 'class' : 'NetworkTopologyStrategy',  'datacenter1': 1  };")
        .then(async result => {
            await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
            /*console.log(result)*/
        }).catch(error => console.error(error));

    //Goes inside adora moderation keyspace, makes the table "trackedytvideoids"
    await cassandraclient.execute("CREATE TABLE IF NOT EXISTS adorastats.trackedytvideosids (videoid text PRIMARY KEY, added timeuuid);")
        .then(async result => {
            await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
            /*console.log(result)*/
        }).catch(error => console.error(error));

    //Goes inside adorastats keyspace, makes the table "ytvideostats"
    await cassandraclient.execute("CREATE TABLE IF NOT EXISTS adorastats.ytvideostats (videoid text, time timeuuid, views bigint, likes bigint, dislikes bigint, PRIMARY KEY (videoid, time));")
        .then(async result => {
            await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
        }).catch(error => console.error(error));

        //add paint the town to the list of default videos
    await addVideoToTrackList("_EEo-iE5u_A")
}

export async function addVideoToTrackList(videoid) {
    var query = "INSERT INTO adorastats.trackedytvideosids (videoid, added) VALUES (?,?)"
    var params = [videoid, TimeUuid.now()]
    await cassandraclient.execute(query, params)
    .then(async result => {
        await logger.discordDebugLogger.debug({ type: "cassandraclient", result: result })
    }).catch(error => console.error(error));
}

export async function addStatsToYtVideo(videoid,views,likes,dislikes) {
    var query = "INSERT INTO adorastats.ytvideostats (videoid, time, views, likes, dislikes) VALUES (?,?,?,?,?)"
    var params = [videoid, TimeUuid.now(),views,likes,dislikes]
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
        var fullUrlOfVideo = `https://www.youtube.com/watch?v=${row.videoid}`
        let { data } = await axios.get(fullUrlOfVideo);

        //logger.discordInfoLogger.info(data, {type: 'youtubeHtmlRespond'})
       // var viewCount = parseInt(data.match(/<meta itemprop="interactionCount" content="[^"]">/g)[0],10)
       var viewCount = parseInt(data.match(/<meta itemprop="interactionCount" content="([^">]*)">/g)[0].replace(/<meta itemprop="interactionCount" content="/g,"").replace(/">/,""),10)

       var likedisliketooltipMatches = data.match(/"tooltip":"(\d||,)+ \/ (\d||,)+"/g)

       console.log('likeddisliketooltipmatches', likedisliketooltipMatches)

       var likedisliketooltip = likedisliketooltipMatches[0].replace(/"tooltip": ?"/g,"").replace(/"/g,"")

       var likeanddislikearray = likedisliketooltip.split("/");

       console.log('splittedArray', likeanddislikearray)

       console.log("likeCountAttempt",likeanddislikearray[0])
       var likeCount = parseInt(likeanddislikearray[0].trim().replace(/,/g,""),10)

       var dislikeCount = parseInt(likeanddislikearray[1].trim().replace(/,/g,""),10)

        console.log(viewCount)
        console.log("likeCount",likeCount)
        console.log("dislikeCount",dislikeCount)
        await addStatsToYtVideo(row.videoid,viewCount,likeCount,dislikeCount)
        //Cherio inerpretation of HTML contents
       // const $ = cio.load(data);
        //find lyrics inside div element, trim off whitespace
        //let lyrics = $('div[class="lyrics"]').text().trim();

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

