"use strict";
exports.__esModule = true;
var requestjson = require('request-json');
var editJsonFile = require("edit-json-file");
var storeYtStats_1 = require("./modules/storeYtStats");
var _a = require('./config.json'), prefix = _a.prefix, token = _a.token, youtubeApiKeys = _a.youtubeApiKeys, googlecloudprojectid = _a.googlecloudprojectid, googlecloudkeyFilename = _a.googlecloudkeyFilename;
var youtubeApiKeyRandomlyChosen = youtubeApiKeys[Math.floor(Math.random() * youtubeApiKeys.length)];
function pullId(id) {
    var pathForYtRequest = "https://youtube.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=" + id + "&key=" + youtubeApiKeyRandomlyChosen;
    var youtubeclient = requestjson.createClient('https://youtube.googleapis.com/');
    youtubeclient.get(pathForYtRequest, function (err, res, body) {
        storeYtStats_1.storeYoutubeDataIntoDatabase(body);
    });
}
function pullDataFromSet() {
    pullId("-5q5mZbe3V8");
    pullId("_sxUG8O6M2w");
    //bangtan youtube music
}
function pullDataFromSet5min() {
    pullId("Q6CRKXKpdSM");
    pullId("YSuOwf24psk");
    pullId("amnspvOH-EE");
    pullId("YkGEbnNj48k");
    pullId("jzHtHAg2igc");
    pullId("rSi4UIWbtM0");
    pullId("evBAiaYal1o");
    pullId("HaEYUJ2aRHs");
    pullId("yIvb4csSgcs");
}
pullDataFromSet();
//pullDataFromSet5min()
setInterval(function () {
    pullDataFromSet();
}, 60 * 1000);
/**
setInterval(function() {
    pullDataFromSet()
},5*60*1000)
*/ 
