import { isAuthorizedAdmin } from "./moderation";

export async function adminhelp(adminhelpargs) {
    if (isAuthorizedAdmin(adminhelpargs.message.author.id)) {
        await adminhelpargs.message.reply({embeds: [{
            "title": "Adora Admins Only Help Page",
            "description": "Only Admins of can see this page",
            "fields": [
              {
                "name": "`a!adoraban`",
                "value": "a!adoraban <user id list/tags> <reason (max 512 chars)>`: Inserts bans into database and completes bans on all shards"
              },
              {
                  "name": `a!adoraunban`,
                  "value": "a!adoraunban <user id list/tags> <reason (max 512 chars)>`: Unbans on all subscribed servers, then removes from database"
              },
              {
                "name": `a!adorakickoutofserver <list of server ids>`,
                "value": "Kicks a guild off the platform. This is not a ban! They can add it back in a second ahahah"
            },
            {
                "name": `a!currentinfo`,
                "value": "Shows the current message id, channel id, and guild id"
            },
            {
                "name": `a!updatebans`,
                "value": " Force all guilds in all shards to check for bans"
            },
            {
                "name": `a!updatepresence`,
                "value": "Refreshes the presence on all guilds."
            },
            {
                "name": `a!adorabadlink <list of urls seperated by spaces>`,
                "value": "Adds scam nitro urls to the adora phishing database."
            },
            {
                "name": `a!removevideo <id of video to remove>`,
                "value": "Removes video from Youtube tracking database"
            },
            {
                "name": "a!listvideos",
                "value": "List all tracked YouTube videos"
            }
            ]
          }]})
    }
}