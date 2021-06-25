import {Message} from 'discord.js';

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
          "title": "Help - Music Charts & Statistics",
          "description": "Access live information across music charts and platforms",
          "fields": [
            {
              "name": "`a!billboard`",
              "value": "View latest & historical Billboard Charts, run `a!billboard` for more info\nAlias: `a!bb`"
            },
            {
              "name": "`a!bbp`",
              "value": "View statistics for billboard polls, run command for more info"
            },
            {
              "name": "`a!bv`",
              "value": "Retrieve voting links for billboard polls, run command for a list of polls"
            },
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
          "title": "Help - Moderation",
          "description": "Make protecting your community easier!",
          "fields": [
            {
              "name": "`a!autoban`",
              "value": "Automatically block known-raid accounts from blacklists before they come to your server, run command for more info"
            },
            {
              "name": "`a!ban (mentions/userids) [reason]`",
              "value": "a!ban can ban as many users via mention or user ids with an optional reason"
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
              "name": "`a!inspect  (mentions/userids)`",
              "value": "Shows info of user like Flags, Account creation time, Banlist status, and icon!"
            }
          ]
        },
        {
          "title": "Help - Adora",
          "description": "General tools and access!",
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
                "value": "Vote for Adora on Top.gg links"
            },
            {
                "name": "`a!votes`",
                "value": "Shows leaderboard of voters"
            }
            {
              "name": "I have an idea for a command or feedback!",
              "value": "We'd love to hear it! Please join our support server and tell us! Run `a!invite` for the invite link to our Support & Suggestion Adorabot Discord Server"
            },
            {
              "name": "Credits",
              "value": "Developer: Kyler#9100\nAdmins: Moka\nThank you to all that contribute code, feedback, and ban reports! Y'all make this bot better so thanks for using it"
            }
          ]
        }]
      }).catch(console.error());
}