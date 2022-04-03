import {createDatabases, fetchStatsForAll} from './youtubeviewcountdaemon'
const editJsonFile = require("edit-json-file");

var authconfigfile = editJsonFile(`${__dirname}/../config.json`);
var loadedAuthData = authconfigfile.get()

var intervalForYt = 60 * 1000 * 10;

if (loadedAuthData.config) {
  if (loadedAuthData.config.youtubeInterval)  {
    intervalForYt = loadedAuthData.config.youtubeInterval
  }
}
console.log('init')

var numberOfTimesRun = 0;

createDatabases()
fetchStatsForAll({
  runAll: false,
  currentSegment: numberOfTimesRun
})

setInterval(function() {
  numberOfTimesRun = numberOfTimesRun + 1;
    fetchStatsForAll({
      runAll: false,
      currentSegment: numberOfTimesRun 
    })
    try {
        if (global.gc) {global.gc();}
      } catch (e) {
        
      }
}, intervalForYt);// your code goes here... // 60 * 1000 milsec
//addVideoToTrackList("_EEo-iE5u_A")