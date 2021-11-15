import {createDatabases, fetchStatsForAll} from './youtubeviewcountdaemon'
const fs = require('fs');
const v8 = require('v8');

console.log('init')

createDatabases()
fetchStatsForAll()

setInterval(function() {
    fetchStatsForAll()
    try {
        if (global.gc) {global.gc();}
      } catch (e) {
        
      }
      fs.promises.writeFile(
        `${Date.now()}.heapsnapshot`,
        v8.getHeapSnapshot()
      );
}, 60 * 1000 * 10);// your code goes here... // 60 * 1000 milsec
//addVideoToTrackList("_EEo-iE5u_A")