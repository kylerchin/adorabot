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

createDatabases()
fetchStatsForAll()

setInterval(function() {
    fetchStatsForAll()
    try {
        if (global.gc) {global.gc();}
      } catch (e) {
        
      }
}, intervalForYt);// your code goes here... // 60 * 1000 milsec
//addVideoToTrackList("_EEo-iE5u_A")