const Discord = require('discord.js');

export async function editProfile(msg, args) {

/*

    if args are blank, explain shit

    fetch the account in tables user
    
    if user's first time, start the first page with the description, "Hello, World! This profile is blank."

    if args has <page number> but nothing else, say you need a valid selector. (List selectors)
    
    if args has <page number> delete <selector>, delete the contents and the value of the selector.

    if args has invalid page number, list the avaliable pages and describe the add, delete, move page operations

    if args has <page number> <selector> <value>, check if everything is valid, otherwise, throw error.
    If it's okay, then store the value.

    if args has <deleteProfile>, then ask y/n that you want to delete your ENTIRE profile for username ${user.username}

    */

} 

export async function fetchProfile(msg, args) {
    
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