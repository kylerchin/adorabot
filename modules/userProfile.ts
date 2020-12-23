const Discord = require('discord.js');

async function explainSelectors(message) {
    const exampleEmbed = {
        "content": "content",
        "embed": {
          "title": "title",
          "description": "description",
          "url": "https://discordapp.com",
          "color": 14669538,
          "timestamp": Date.now(),
          "footer": {
            "icon_url": "https://cdn.discordapp.com/embed/avatars/4.png",
            "text": "footertext"
          },
          "thumbnail": {
            "url": "https://cdn.discordapp.com/embed/avatars/1.png"
          },
          "image": {
            "url": "https://cdn.discordapp.com/embed/avatars/3.png"
          },
          "author": {
            "name": "authorname",
            "url": "https://discordapp.com",
            "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png"
          },
          "fields": [
            {
              "name": "field1name",
              "value": "field1value"
            },
            {
              "name": "field2name",
              "value": "field2value"
            },
            {
              "name": "...",
              "value": "..."
            },
            {
              "name": "field24name",
              "value": "field24value"
            },
            {
              "name": "field25name",
              "value": "field25value"
            }
          ]
        }
      }

      message.channel.send("Here are the selectors avaliable")
      message.channel.send(exampleEmbed)
      message.channel.send("You can use any of the fields, but they will be blank by default. \n" +
      "Emojis are valid in text fields!!!!\n" +
      "There are up to 25 fields, which you can set using field*1-25*name and field*1-25*value.\n" +
      "Additionally, by default, the fields are not inline, but you can force inline by changing field*1-25*inline to `true` or back to `false`\n" +
      "You should add links to the `content` field, as they will show up as rich embeds. \n You can add images by adding urls to `footerimage`,`authorimage`,`thumbnailimage`,`image`\n" + 
      "Finally, there are three url fields you can set. They are `authorurl`, `url`, and `footer_url`")
}

export async function editProfile(client, message, args,cassandraclient) {

    message.channel.send("This feature is in alpha and isn't ready for full use yet. You are welcome to try and poke at it, but Kyler and I can't promise anything. Data may be lost, beware! :) \n Stream Mikrokosmos!")

/*

    if args are blank, explain shit

    **/

    if(args.length <= 0) {
       const profileHelpPageEmbed = {
        "embed": {
          "title": "Adora Profile Help Page",
          "description": "anything inside with **<>** are variables",
          "color": 12143841,
          "footer": {
            "text": "Built by Kyler#9100"
          },
          "fields": [
            {
              "name": "`a! editbio edit <page number> <field> <content>`",
              "value": "Creates / Edits the field on specified page with the content"
            },
            {
              "name": "`a! editbio edit <page number> <field> delete`",
              "value": "Deletes the field from the page"
            },
            {
              "name": "`a! editbio createpg <optional: page number>`",
              "value": "Creates page following <page number> or just adds a page to the end."
            },
            {
              "name": "`a! editbio deletepg <page number>`",
              "value": "Deletes the page number."
            },
            {
              "name": "`a! editbio movepg <original page number> <page to put in front of>`",
              "value": "Moves the page to after the second number"
            },
            {
              "name": "`a! editbio createbio`",
              "value": "Creates your bio",
              "inline": true
            },
            {
              "name": "`a! editbio deletebio`",
              "value": "Deletes your bio. **IRREVERSIBLE!!!!!**",
              "inline": true
            },
            {
              "name": "`a! bio <optional: mention / userid>`",
              "value": "views your bio or someone elses bio"
            }
          ]
        }
      }

      message.channel.send(profileHelpPageEmbed)
      explainSelectors(message)
    }

    /** 

    fetch the account in tables user
    
    if user's first time, start the first page with the description, "please create your new profile with `a! createbio`"

    if args has <page number> but nothing else, say you need a valid selector. (List selectors)
    
    if args has <page number> delete <selector>, delete the contents and the value of the selector.

    if args has invalid page number, list the avaliable pages and describe the add, delete, move page operations

    if args has <page number> <selector> <value>, check if everything is valid, otherwise, throw error.
    If it's okay, then store the value.

    if args has <deleteProfile>, then ask y/n that you want to delete your ENTIRE profile for username ${user.username}

    */

} 

export async function fetchProfile(client, message, args, cassandraclient) {
    
    /*

    fetch the account in tables user

    const query = 'SELECT embed_uuids FROM user WHERE user_id = ?';
    client.execute(query, [SOME DISCORD USER ID], callback);

    if (userprofile not found), say "This user doesn't have a profile. create your own with !a editbio"

    if there is a user, get the list of the embeds

    For each embed, fetch the contents of the Map.

    Shove it into an array valid for a few hours, then pull from it for the answers of the field like

    1:{desc: "a"}, 2: {desc: "b"}

    Allow you to flip through each page.

    */

}