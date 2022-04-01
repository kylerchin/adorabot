import { isAuthorizedAdmin } from "./moderation";

export async function adminhelp(adminhelpargs) {
    if (isAuthorizedAdmin(adminhelpargs.message.author.id)) {
        await adminhelpargs.message.reply({
            content: "**Adora Admin Help Page**\nAll commands here can only be accessed by an authorized administrator.",
            embeds: [
                {
                    "title": "General",
                    "description": "Debugging commands",
                    "fields": [
                        {
                            "name": `a!updatepresence`,
                            "value": "Refreshes the presence on all guilds."
                        },
                        {
                            "name": `a!currentinfo`,
                            "value": "Shows the current message id, channel id, and guild id"
                        },
                        {
                            "name": `a!manualvoteadd`,
                            "value": `\`a!manualvoteadd <userid> <service>\`\nAdds vote manually to system`
                        }
                    ]
                },
                {
                    "title": "Autoban Users / Links Manager",
                    "description": "Only Admins of can see this page",
                    "fields": [
                        {
                            "name": "a!adoraban",
                            "value": "a!adoraban <user id list/tags> <reason (max 512 chars)>`: Inserts bans into database and completes bans on all shards"
                        },
                        {
                            "name": `a!adoraunban`,
                            "value": "a!adoraunban <user id list/tags> <reason (max 512 chars)>`: Unbans on all subscribed servers, then removes from database"
                        },
                        {
                            "name": `a!updatebans`,
                            "value": " Force all guilds in all shards to check for bans"
                        },
                        {
                            "name": `a!adorabadlink <list of urls seperated by spaces>`,
                            "value": "Adds scam nitro urls to the adora phishing database."
                        }
                    ]
                },
                {
                    "title": "Guild Manager",
                    "description": "Only Admins of can see this page",
                    "fields": [
                        {
                            "name": "a!guilds",
                            "value": "List all guilds in Adora"
                        },
                        {
                            "name": `a!adorakickoutofserver <list of server ids>`,
                            "value": "Kicks a guild off the platform. This is not a ban! They can add it back in a second ahahah"
                        },
                        {
                            "name": `a!inspectguild <guildid>`,
                            "value": "Shows the Guild name, adoraban on status, member count, and banner"
                        },
                        {
                            "name": `a!addguildautoban <guildid>`,
                            "value": "Turns on Adora in that server. Run `a!updatebans` after to start banning users automatically"
                        },
                        {
                            "name": `a!banfromguild <guildid> <userid>`,
                            "value": "Remotely bans the userid from the guildid and deletes all messages in the past 7 days."
                        }
                    ]
                },
                {
                    "title": "YouTube Manager",
                    "fields": [{
                        "name": `a!removevideo <id of video to remove>`,
                        "value": "Removes video from Youtube tracking database"
                    },
                    {
                        "name": "a!listvideos",
                        "value": "List all tracked YouTube videos"
                    }]
                }]
        })
    }
}