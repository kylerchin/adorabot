"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var requestjson = require('request-json');
var storeYtStats_1 = require("./storeYtStats");
var ytScraper = require("yt-scraper");
// Exporting the class which will be 
// used in another file 
// Export keyword or form should be 
// used to use the class  
// Class method which prints the 
// user called in another file 
function sendYtCountsEmbed(id, message, apikey) {
    return __awaiter(this, void 0, void 0, function () {
        var pathForYtRequest, youtubeclient;
        return __generator(this, function (_a) {
            try {
                pathForYtRequest = "https://youtube.googleapis.com/youtube/v3/videos?part=snippet,statistics,status,liveStreamingDetails&id=" + id + "&key=" + apikey;
                youtubeclient = requestjson.createClient('https://youtube.googleapis.com/');
                youtubeclient.get(pathForYtRequest, function (err, res, body) {
                    return __awaiter(this, void 0, void 0, function () {
                        var channelIdOfVideo, pathForChannelOfVideoRequest;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    console.log(body);
                                    console.log(body.items);
                                    channelIdOfVideo = body.items[0].snippet.channelId;
                                    pathForChannelOfVideoRequest = "https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2Cstatistics%2Cstatus%2CtopicDetails&id=" + channelIdOfVideo + "&key=" + apikey;
                                    return [4 /*yield*/, youtubeclient.get(pathForChannelOfVideoRequest, function (channelErr, channelRes, channelBody) {
                                            return __awaiter(this, void 0, void 0, function () {
                                                var videostats, embedYtStats;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            videostats = body.items[0].statistics;
                                                            embedYtStats = {
                                                                "embed": {
                                                                    "url": "https://youtube.com/watch?v=" + body.items[0].id,
                                                                    "description": "*" + channelBody.items[0].snippet.title + "*\n" + "https://youtu.be/" + body.items[0].id,
                                                                    "color": 16711680,
                                                                    "timestamp": Date.now(),
                                                                    "footer": {
                                                                        "text": "Drink water uwu <3 #BLM #ACAB"
                                                                    },
                                                                    "thumbnail": {
                                                                        "url": body.items[0].snippet.thumbnails["default"].url
                                                                    },
                                                                    "author": {
                                                                        "name": body.items[0].snippet.title,
                                                                        "url": "https://youtube.com/watch?v=" + body.items[0].id,
                                                                        "icon_url": channelBody.items[0].snippet.thumbnails["default"].url
                                                                    },
                                                                    "fields": [
                                                                        {
                                                                            "name": "Views :eyes:",
                                                                            "value": parseInt(videostats.viewCount).toLocaleString('en-US')
                                                                        },
                                                                        {
                                                                            "name": "Likes :thumbsup:",
                                                                            "value": parseInt(videostats.likeCount).toLocaleString('en-US'),
                                                                            "inline": true
                                                                        },
                                                                        {
                                                                            "name": "Dislikes :thumbsdown:",
                                                                            "value": parseInt(videostats.dislikeCount).toLocaleString('en-US'),
                                                                            "inline": true
                                                                        },
                                                                        {
                                                                            "name": "Comments :speech_balloon:",
                                                                            "value": parseInt(videostats.commentCount).toLocaleString('en-US')
                                                                        }
                                                                    ]
                                                                }
                                                            };
                                                            return [4 /*yield*/, message.channel.send(embedYtStats)];
                                                        case 1:
                                                            _a.sent();
                                                            try {
                                                                storeYtStats_1.storeYoutubeDataIntoDatabase(body);
                                                            }
                                                            catch (_b) {
                                                                console.log("logging this chart failed!");
                                                            }
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            });
                                        })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
            }
            catch (_b) {
                message.channel.send("Ooops, Youtube crashed... try again?");
            }
            return [2 /*return*/];
        });
    });
}
exports.sendYtCountsEmbed = sendYtCountsEmbed;
