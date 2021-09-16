import {createDatabases, fetchStatsForAll} from './youtubeviewcountdaemon'

createDatabases()
fetchStatsForAll()

setInterval(function() {
    fetchStatsForAll()
}, 60 * 1000 * 2);// your code goes here... // 60 * 1000 milsec
//addVideoToTrackList("_EEo-iE5u_A")