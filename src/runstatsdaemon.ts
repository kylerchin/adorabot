import {createDatabases, fetchStatsForAll} from './youtubeviewcountdaemon'

console.log('init')

createDatabases()
fetchStatsForAll()

setInterval(function() {
    fetchStatsForAll()
    try {
        if (global.gc) {global.gc();}
      } catch (e) {
        
      }
}, 60 * 1000 * 10);// your code goes here... // 60 * 1000 milsec
//addVideoToTrackList("_EEo-iE5u_A")