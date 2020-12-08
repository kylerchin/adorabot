
const requestjson = require('request-json');
const editJsonFile = require("edit-json-file");
import { storeYoutubeDataIntoDatabase } from "./modules/storeYtStats"; 

const { prefix, token, youtubeApiKeys, googlecloudprojectid, googlecloudkeyFilename } = require('./config.json');

const youtubeApiKeyRandomlyChosen = youtubeApiKeys[Math.floor(Math.random() * youtubeApiKeys.length)];

function pullId(id) {
    const pathForYtRequest = "https://youtube.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=" + id + "&key=" + youtubeApiKeyRandomlyChosen

        var youtubeclient = requestjson.createClient('https://youtube.googleapis.com/');
      
        youtubeclient.get(pathForYtRequest, function(err, res, body) {
            storeYoutubeDataIntoDatabase(body)
        })
}

function pullDataFromSet() {
    pullId("-5q5mZbe3V8")
    pullId("_sxUG8O6M2w")
    //bangtan youtube music
}

function pullDataFromSet5min() {
    pullId("Q6CRKXKpdSM")
    pullId("YSuOwf24psk")
    pullId("amnspvOH-EE")
    pullId("YkGEbnNj48k")
    pullId("jzHtHAg2igc")
    pullId("rSi4UIWbtM0")
    pullId("evBAiaYal1o")
    pullId("HaEYUJ2aRHs")
    pullId("yIvb4csSgcs")
}

pullDataFromSet()

//pullDataFromSet5min()

setInterval(function() {
    pullDataFromSet()
},60*1000)
/** 
setInterval(function() {
    pullDataFromSet()
},5*60*1000)
*/