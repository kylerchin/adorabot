import {Message} from 'discord.js';
import { logger } from './logger';

interface helpDirArgs {
    message: Message,
    command: any,
    args: any,
    [key:string]: any
}

export function helpDirectory(helpDirArgs: helpDirArgs) {
    //msg.channel.send("**Adora Commands**").catch(console.error());;
    helpDirArgs.message.channel.send({
        "content": "**Adora Commands**",
        "embeds": [{
          "title": "Music Charts & Statistics",
          "description": "Access live information across music charts and platforms",
          "color": 0xf3ccbd,
          "fields": [
            {
              "name": "`a!billboard list/[Chart Name]`",
              "value": "View latest & historical Billboard Charts, run `a!billboard` for more info\n`a!list` to list all the chart codes\nAlias: `a!bb`"
            },
            /*{
              "name": "`a!bbp`",
              "value": "View statistics for billboard polls, run command for more info"
            },
            {
              "name": "`a!bv`",
              "value": "Retrieve voting links for billboard polls, run command for a list of polls"
            },*/
            {
              "name": "`a!youtube`",
              "value": "`a!youtube <video link / search for a video>`: Realtime view counter for YouTube videos. \n Example: `a! youtube fake love music video` or `a! youtube https://www.youtube.com/watch?v=gdZLi9oWNZg`, run `a!youtube` for more information\nAlias: `a!yt`"
            },
            {
              "name": "`a!lyrics [Search Term]`",
              "value": "Shows lyrics of a song from Genius"
            }
          ]
        },
      /*  {
          "title": "YouTube Player",
          "description": "Watch YouTube Videos in Voice Channel Together",
          "color": 0xeebcbb,
          "fields": [
            {
              "name": "`a!ytparty`",
              "value": "Start a YouTube Watch Party in the current voice channel."
            }
          ]
        },*/
        {
          "title": "Billboard Polls",
          "description": "Latest Billboard Poll Scores and Vote Links",
          "color": 0xe7acc2,
          "fields": [
            {
              "name": "`a!bbp`",
              "value": "View vote tallys for billboard polls, run command for a list of polls",
              "inline": true
            },
            {
              "name": "`a!bv`",
              "value": "Show Voting links for billboard polls, run command for a list of polls",
              "inline": true
            },
          ]
        },
        {
          "title": "Moderation commands",
          "description": "Make protecting your community easier!",
          "color": 0xd6b5d4,
          "fields": [
            {
              "name": "`a!autoban`",
              "value": "Automatically block known-raid accounts from blacklists before they come to your server, run command for more info\n`a!autoban on` to enable the global blacklist, `a!autoban off` to turn it off."
            },
            {
              "name": "`a!ban (mentions/userids) [reason]`",
              "value": "`a!ban` can ban as many users via mention or user ids with an optional reason"
            },
            {
              "name": "`a!banpurge (mentions/userids) [reason]`",
              "value": "Same thing as `a!ban` but also deletes all the users messages. Good for raids."
            },
            {
              "name": "`a!unban (mentions/userids) [reason]`",
              "value": "Unban as many users via mention or user ids with an optional reason"
            },
            {
              "name": "`a!wrongfulban`",
              "value": "Report wrongful bans applied by the Adora system and we'll investigate and unban as quickly as we can."
            },
            {
              "name": "`a!inspect (mentions/userids)`",
              "value": "Shows info of user like Flags, Account creation time, Banlist status, and icon!"
            }
          ]
        },
        {
          "title": "General commands",
          "description": "Ping, Support server, and vote for the bot commands",
          "color": 0xb2c9e9,
          "fields": [
            {
              "name": "`a!ping`",
              "value": "Pong! Returns the bot's latency to Discord's servers."
            },
            {
              "name": "`a!invite`",
              "value": "Invite the bot to all your friend's servers! Shows invite link and support server."
            },
            {
              "name": "`a!botstats`",
              "value": "Shows adora bot statistics"
            },
            {
                "name": "`a!vote`",
                "value": "Vote for Adora on Top.gg links",
                "inline": true
            },
            {
                "name": "`a!votes`",
                "value": "Shows leaderboard of voters",
                "inline": true
            },
            {
              "name": "I have an idea for a command or feedback!",
              "value": "We'd love to hear it! Please join our support server and tell us! Run `a!invite` for the invite link to our Support & Suggestion Adorabot Discord Server"
            }
            /*{
              "name": "Credits",
              "value": "Developer: Kyler#9100\nAdmins: Moka\nThank you to all that contribute code, feedback, and ban reports! Y'all make this bot better so thanks for using it"
            }*/
          ]
        }]
      }).catch((error) => {logger.discordErrorLogger.error(error)});
}


export function helpDirectoryTest(helpDirArgs: helpDirArgs) {
  //msg.channel.send("**Adora Commands**").catch(console.error());;
  helpDirArgs.message.channel.send({
      "content": "**Adora Commands**",
      "embeds": [{
        "title": "Music Charts & Statistics",
        "description": "Access live information across music charts and platforms",
        "color": 0xf3ccbd,
        "fields": [
          {
            "name": "`a!billboard list/[Chart Name]`",
            "value": "View latest & historical Billboard Charts, run `a!billboard` for more info\n`a!list` to list all the chart codes\nAlias: `a!bb`"
          },
          /*{
            "name": "`a!bbp`",
            "value": "View statistics for billboard polls, run command for more info"
          },
          {
            "name": "`a!bv`",
            "value": "Retrieve voting links for billboard polls, run command for a list of polls"
          },*/
          {
            "name": "`a!youtube`",
            "value": "`a!youtube <video link / search for a video>`: Realtime view counter for YouTube videos. \n Example: `a! youtube fake love music video` or `a! youtube https://www.youtube.com/watch?v=gdZLi9oWNZg`, run `a!youtube` for more information\nAlias: `a!yt`"
          },
          {
            "name": "`a!lyrics [Search Term]`",
            "value": "Shows lyrics of a song from Genius"
          }
        ]
      },
      {
        "title": "YouTube Player",
        "description": "Watch YouTube Videos in Voice Channel Together",
        "color": 0xeebcbb,
        "fields": [
          {
            "name": "`a!ytparty`",
            "value": "Start a YouTube Watch Party in the current voice channel."
          }
        ]
      },
      {
        "title": "Billboard Polls",
        "description": "Latest Billboard Poll Scores and Vote Links",
        "color": 0xe7acc2,
        "fields": [
          {
            "name": "`a!bbp`",
            "value": "View vote tallys for billboard polls, run command for a list of polls",
            "inline": true
          },
          {
            "name": "`a!bv`",
            "value": "Show Voting links for billboard polls, run command for a list of polls",
            "inline": true
          },
        ]
      },
      {
        "title": "Moderation commands",
        "description": "Make protecting your community easier!",
        "color": 0xd6b5d4,
        "fields": [
          {
            "name": "`a!autoban`",
            "value": "Automatically block known-raid accounts from blacklists before they come to your server, run command for more info\n`a!autoban on` to enable the global blacklist, `a!autoban off` to turn it off."
          },
          {
            "name": "`a!ban (mentions/userids) [reason]`",
            "value": "`a!ban` can ban as many users via mention or user ids with an optional reason"
          },
          {
            "name": "`a!banpurge (mentions/userids) [reason]`",
            "value": "Same thing as `a!ban` but also deletes all the users messages. Good for raids."
          },
          {
            "name": "`a!unban (mentions/userids) [reason]`",
            "value": "Unban as many users via mention or user ids with an optional reason"
          },
          {
            "name": "`a!wrongfulban`",
            "value": "Report wrongful bans applied by the Adora system and we'll investigate and unban as quickly as we can."
          },
          {
            "name": "`a!inspect (mentions/userids)`",
            "value": "Shows info of user like Flags, Account creation time, Banlist status, and icon!"
          }
        ]
      },
      {
        "title": "General commands",
        "description": "Ping, Support server, and vote for the bot commands",
        "color": 0xb2c9e9,
        "fields": [
          {
            "name": "`a!ping`",
            "value": "Pong! Returns the bot's latency to Discord's servers."
          },
          {
            "name": "`a!invite`",
            "value": "Invite the bot to all your friend's servers! Shows invite link and support server."
          },
          {
            "name": "`a!botstats`",
            "value": "Shows adora bot statistics"
          },
          {
              "name": "`a!vote`",
              "value": "Vote for Adora on Top.gg links",
              "inline": true
          },
          {
              "name": "`a!votes`",
              "value": "Shows leaderboard of voters",
              "inline": true
          },
          {
            "name": "I have an idea for a command or feedback!",
            "value": "We'd love to hear it! Please join our support server and tell us! Run `a!invite` for the invite link to our Support & Suggestion Adorabot Discord Server"
          },
          {
            "name": "Links",
            "value": "Terms of Service: https://github.com/kylerchin/adorabot/blob/master/tos.md\nPrivacy Policy: https://github.com/kylerchin/adorabot/blob/master/privacy.md"
          }
          /*{
            "name": "Credits",
            "value": "Developer: Kyler#9100\nAdmins: Moka\nThank you to all that contribute code, feedback, and ban reports! Y'all make this bot better so thanks for using it"
          }*/
        ]
      }]
    }).catch((error) => {logger.discordErrorLogger.error(error)});
}