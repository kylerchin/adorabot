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
var jsdom = require('jsdom');
var dom = new jsdom.JSDOM();
var window = dom.window;
var document = window.document;
var $ = require('jquery')(window);
console.log('jquery version:', $.fn.jquery);
function billboardVote(msg, args) {
    var precurserpoll = "Remember to vote on a different browser, device, incognito mode, or clear cookies! The bot won't let you vote as the same cookie session. If you see \"Thank you, we have counted your vote\", you are repeat voting and your new vote is not counted!\n";
    if (args[0]) {
        if (args[0] === "1") {
            msg.channel.send(precurserpoll + "https://www.billboard.com/articles/columns/pop/9420280/favorite-boy-band-of-all-time-poll");
        }
        else {
            if (args[0] === "2") {
                msg.channel.send(precurserpoll + "https://www.billboard.com/articles/columns/pop/9418334/favorite-boy-band-album-poll");
            }
            else {
                msg.channel.send("Select Poll to Vote:\n" +
                    "`a! bv 1`: \"What's Your Favorite Boy Band of All Time?\"\n" +
                    "`a! bbp 2` : \"What's Your Favorite Boy Band Album from the Past 30 Years?\"\n" +
                    "*more polls coming soon, go bug kyler lmao*");
            }
        }
    }
    else {
        msg.channel.send("Select Poll to Vote:\n" +
            "`a! bv 1`: \"What's Your Favorite Boy Band of All Time?\"\n" +
            "`a! bbp 2` : \"What's Your Favorite Boy Band Album from the Past 30 Years?\"\n" +
            "*more polls coming soon, go bug kyler lmao*");
    }
}
exports.billboardVote = billboardVote;
function billboardPollGetValue(msg, args) {
    if (args[0]) {
        var nameArray = [];
        var scoreArray = [];
        var polllink = "";
        if (args[0] === "1") {
            polllink = "https://polls.polldaddy.com/vote-js.php?p=10581243";
        }
        else {
            if (args[0] === "2") {
                polllink = "https://polls.polldaddy.com/vote-js.php?p=10580016";
            }
            else {
                msg.channel.send("We didn't get a valid link!");
                msg.channel.send("**Choose from the following polls**\n" +
                    "`a! bbp 1` : \"What's Your Favorite Boy Band of All Time?\"\n" +
                    "`a! bbp 2` : \"What's Your Favorite Boy Band Album from the Past 30 Years?\"\n" +
                    "**Command: `a! bbp <poll-number> <how-many-top-results>`**");
            }
        }
        if (polllink.length > 1) {
            $.get(polllink, // url
            function (data, textStatus, jqXHR) {
                return __awaiter(this, void 0, void 0, function () {
                    var output1, $content, pollindex, poll2index, pollResultToDiscord, pollResultsFinalArray;
                    return __generator(this, function (_a) {
                        output1 = data.slice(106, -112);
                        console.log(output1);
                        $content = $(output1);
                        nameArray = [];
                        $content.each(function () {
                            $(this).find(".pds-answer-text").each(function (i, row) {
                                var nameAnswer = row.innerHTML;
                                console.log(nameAnswer);
                                nameArray.push(nameAnswer);
                            });
                            $(this).find(".pds-feedback-per").each(function (i, row) {
                                var scoreAnswer = row.innerHTML.replace("&nbsp;", "");
                                //console.log(nameAnswer)
                                scoreArray.push(scoreAnswer);
                            });
                        });
                        pollindex = 0;
                        poll2index = 0;
                        pollResultToDiscord = "";
                        pollResultsFinalArray = [];
                        nameArray.forEach(function (message) {
                            var nextLinePoll = nameArray[pollindex] + " : " + scoreArray[pollindex];
                            pollResultsFinalArray.push(nextLinePoll);
                            pollindex = pollindex + 1;
                        });
                        if (args[1]) {
                            console.log("Argument exists");
                            pollResultsFinalArray = pollResultsFinalArray.slice(0, parseInt(args[1], 10));
                        }
                        else {
                            console.log("No argument");
                        }
                        pollResultsFinalArray.forEach(function (message) {
                            pollResultToDiscord = pollResultToDiscord + message + "\n";
                            poll2index = poll2index + 1;
                        });
                        msg.channel.send(pollResultToDiscord);
                        console.log(nameArray.length);
                        console.log(nameArray[1]);
                        return [2 /*return*/];
                    });
                });
            });
        }
    }
    else {
        msg.channel.send("**Choose from the following polls**\n" +
            "`a! bbp 1` : \"What's Your Favorite Boy Band of All Time?\"\n" +
            "`a! bbp 2` : \"What's Your Favorite Boy Band Album from the Past 30 Years?\"\n" +
            "**Command: `a! bbp <poll-number> <how-many-top-results>`**");
    }
}
exports.billboardPollGetValue = billboardPollGetValue;
