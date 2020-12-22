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
var Discord = require('discord.js');
var sendYtEmbed_1 = require("./sendYtEmbed");
var verboseDiscordLog_1 = require("./verboseDiscordLog");
var billboardPolls_1 = require("./billboardPolls");
var wiktionary = require('wiktionary');
var _a = require('billboard-top-100'), listCharts = _a.listCharts, getChart = _a.getChart;
var isUrl = require("is-url");
var scrapeyoutube = require('scrape-youtube')["default"];
var getQueryParam = require('get-query-param');
var editJsonFile = require("edit-json-file");
var yts = require('yt-search');
var requestjson = require('request-json');
var request = require('request');
var https = require('https');
var translate = require('@vitalets/google-translate-api');
function commandHandler(msg, client, config, dogstatsd) {
    return __awaiter(this, void 0, void 0, function () {
        var args, command, pingReturn, promises, pages_1, page_1, embed_1, youtubeApiKeyRandomlyChosen_1, videoID, precurser, precurser, searchYtString_1, requestToYouTubeOembed, wikitionaryQuery;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!(!msg.content.toLowerCase().startsWith(config.prefix) || msg.author.bot)) return [3 /*break*/, 6];
                    if (!true) return [3 /*break*/, 6];
                    console.log("prefix true");
                    //log triggerprefix adorabot
                    dogstatsd.increment('adorabot.triggerprefix');
                    args = msg.content.slice(config.prefix.length).split(' ');
                    command = args.shift().toLowerCase();
                    console.log("Command is " + command);
                    if (!(command === "ping")) return [3 /*break*/, 2];
                    return [4 /*yield*/, msg.channel.send("Ping?")];
                case 1:
                    pingReturn = _a.sent();
                    pingReturn.edit("**\uD391!** Latency is " + (pingReturn.createdTimestamp - msg.createdTimestamp) + "ms. API Latency is " + Math.round(client.ws.ping) + "ms");
                    _a.label = 2;
                case 2:
                    if (command === 'stats') {
                        promises = [
                            client.shard.fetchClientValues('guilds.cache.size'),
                            client.shard.broadcastEval('this.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0)')
                        ];
                        return [2 /*return*/, Promise.all(promises)
                                .then(function (results) {
                                var totalGuilds = results[0].reduce(function (prev, guildCount) { return prev + guildCount; }, 0);
                                var totalMembers = results[1].reduce(function (prev, memberCount) { return prev + memberCount; }, 0);
                                return msg.channel.send("Server count: " + totalGuilds + "\nMember count: " + totalMembers);
                            })["catch"](console.error)];
                    }
                    if (command === "help") {
                        msg.channel.send("**Adora Commands!**\n" +
                            //     "`a! bbp`: Billboard Polls, run command for more info about each poll\n" +
                            "`a! ping`: Pong! Returns the bot's latency to Discord's servers.\n" +
                            "`a! inviteme`: Invite the bot to all your other servers!\n" +
                            //     "`a! bv`: Billboard voting, use command to select poll\n",
                            "`a! ytstats <video link / search for a video>`: Realtime view counter for YouTube videos. \n Example: `a! ytstats fake love music video` or `a! ytstats https://www.youtube.com/watch?v=gdZLi9oWNZg`\n" +
                            "More coming soon... have an idea/request? Message `Kyler#9100`");
                    }
                    if (command === "translate") {
                        msg.channel.send("");
                    }
                    if (command === "inviteme") {
                        msg.channel.send("Here's the invite link! It's an honor to help you :) \n https://discord.com/api/oauth2/authorize?client_id=737046643974733845&permissions=8&scope=bot");
                    }
                    if (command === "billboard") {
                    }
                    if (command === "gaon" || command === "goan") {
                        pages_1 = ['Page one!', 'Second page', 'Third page'];
                        page_1 = 1;
                        embed_1 = new Discord.MessageEmbed() // Define a new embed
                            .setColor(0xffffff) // Set the color
                            .setFooter("Page " + page_1 + " of " + pages_1.length)
                            .setDescription(pages_1[page_1 - 1]);
                        msg.channel.send({ embed: embed_1 }).then(function (msgGaonEmbed) {
                            msgGaonEmbed.react('⬅').then(function (r) {
                                msgGaonEmbed.react('➡');
                                // Filters
                                var backwardsFilter = function (reaction, user) { return reaction.emoji.name === '⬅' && user.id === msg.author.id; };
                                var forwardsFilter = function (reaction, user) { return reaction.emoji.name === '➡' && user.id === msg.author.id; };
                                var backwards = msgGaonEmbed.createReactionCollector(backwardsFilter, { timer: 6000 });
                                var forwards = msgGaonEmbed.createReactionCollector(forwardsFilter, { timer: 6000 });
                                backwards.on('collect', function (r, u) {
                                    if (page_1 === 1)
                                        return r.users.remove(r.users.cache.filter(function (u) { return u === msg.author; }).first());
                                    page_1--;
                                    embed_1.setDescription(pages_1[page_1 - 1]);
                                    embed_1.setFooter("Page " + page_1 + " of " + pages_1.length);
                                    msgGaonEmbed.edit(embed_1);
                                    r.users.remove(r.users.cache.filter(function (u) { return u === msg.author; }).first());
                                });
                                forwards.on('collect', function (r, u) {
                                    if (page_1 === pages_1.length)
                                        return r.users.remove(r.users.cache.filter(function (u) { return u === msg.author; }).first());
                                    page_1++;
                                    embed_1.setDescription(pages_1[page_1 - 1]);
                                    embed_1.setFooter("Page " + page_1 + " of " + pages_1.length);
                                    msgGaonEmbed.edit(embed_1);
                                    r.users.remove(r.users.cache.filter(function (u) { return u === msg.author; }).first());
                                });
                            });
                        });
                    }
                    if (command === "bv") {
                        billboardPolls_1.billboardVote(msg, args);
                    }
                    if (!(command === "youtubestats" || command === "ytstat" || command === "ytstats")) return [3 /*break*/, 5];
                    youtubeApiKeyRandomlyChosen_1 = config.youtubeApiKeys[Math.floor(Math.random() * config.youtubeApiKeys.length)];
                    videoID = "dQw4w9WgXcQ";
                    if (!isUrl(args[0])) return [3 /*break*/, 3];
                    // Valid url
                    if (args[0].includes("youtu.be/")) {
                        precurser = args[0].replace("youtu.be/", "www.youtube.com/watch?v=");
                    }
                    else {
                        precurser = args[0];
                    }
                    videoID = getQueryParam('v', precurser);
                    sendYtEmbed_1.sendYtCountsEmbed(videoID, msg, youtubeApiKeyRandomlyChosen_1);
                    return [3 /*break*/, 5];
                case 3:
                    // Invalid url
                    console.log("invalid url");
                    searchYtString_1 = msg.content.replace("a!", "").replace(command, "").trim();
                    requestToYouTubeOembed = 'https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=' + searchYtString_1;
                    return [4 /*yield*/, request(requestToYouTubeOembed, function (error, response, body) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!(!error && response.statusCode == 200)) return [3 /*break*/, 1];
                                            console.log("URL is OK"); // Print the google web page.
                                            videoID = getQueryParam('v', 'https://www.youtube.com/watch?v=' + searchYtString_1);
                                            console.log(videoID + " is the videoID");
                                            sendYtEmbed_1.sendYtCountsEmbed(videoID, msg, youtubeApiKeyRandomlyChosen_1);
                                            return [3 /*break*/, 3];
                                        case 1:
                                            //video ID is not valid
                                            // search youtube for term instead
                                            console.log("searching for:" + searchYtString_1);
                                            //const r = await yts( searchYtString )
                                            //console.log(r)
                                            return [4 /*yield*/, scrapeyoutube.search(searchYtString_1).then(function (results) {
                                                    // Unless you specify a type, it will only return 'video' results
                                                    videoID = results.videos[0].id;
                                                    console.log(results.videos[0]);
                                                    console.log(videoID);
                                                    sendYtEmbed_1.sendYtCountsEmbed(videoID, msg, youtubeApiKeyRandomlyChosen_1);
                                                })];
                                        case 2:
                                            //const r = await yts( searchYtString )
                                            //console.log(r)
                                            _a.sent();
                                            _a.label = 3;
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            });
                        })];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    if (command === 'wiktionary') {
                        wikitionaryQuery = msg.content.replace("a! wiktionary", "").trim();
                        wiktionary(wikitionaryQuery).then(function (result) {
                            console.log(result);
                            var discordResponse = result.html.replace(new RegExp('<(/)?i(\S||\s)*?>', "gm"), "_").replace(new RegExp('<(/)?b(\S||\s)*?>', "gm"), "**").replace(new RegExp("(<([^>]+)>)", "gm"), "");
                            console.log(discordResponse);
                            var discordResponseArray = discordResponse.split("\n");
                            console.log(discordResponseArray);
                            var previousMessageWiktionaryBlankLine = true;
                            discordResponseArray.forEach(function (element) {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                if (!(element === "")) return [3 /*break*/, 3];
                                                if (!(previousMessageWiktionaryBlankLine === false)) return [3 /*break*/, 2];
                                                return [4 /*yield*/, msg.channel.send("\u2800")];
                                            case 1:
                                                _a.sent();
                                                previousMessageWiktionaryBlankLine = true;
                                                _a.label = 2;
                                            case 2: return [3 /*break*/, 5];
                                            case 3: return [4 /*yield*/, msg.channel.send(element)];
                                            case 4:
                                                _a.sent();
                                                previousMessageWiktionaryBlankLine = false;
                                                _a.label = 5;
                                            case 5: return [2 /*return*/];
                                        }
                                    });
                                });
                            });
                        });
                    }
                    if (command === 'fetchvoiceregions') {
                        client.fetchVoiceRegions()
                            .then(function (regions) { return msg.channel.send("Available regions are: " + regions.map(function (region) { return region.name; }).join(', ')); })["catch"](console.error);
                    }
                    if (msg.content.includes("Guys boy I'm home alone now and I'm free If anyone wants to get my nudes message me for free")) {
                        console.log("wtf is this shit");
                        verboseDiscordLog_1.verboseDiscordLog("code 1d10t \n" + "content: " + msg.content + "\nmessage.id: " + msg.id + "\nauthor.id:" + msg.author.id, client);
                    }
                    if (command === "bbp") {
                        billboardPolls_1.billboardPollGetValue(msg, args);
                    }
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.commandHandler = commandHandler;
