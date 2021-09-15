import { Message } from "discord.js";

const bud = require('basic-instagram-user-details');
 
//const user = 'twicetagram';
/* 
bud(user, 'id').then(id => {
  console.log(id);
  // => { data: '259220806' }
});*/

const userInstagram = require("user-instagram");

function getLatestPosts(username) {
    // Gets informations about a user
userInstagram(username) // Same as getUserData()
.then(console.log)
.catch(console.error);
}

interface igprofileinterface {
    message: any;
    args: any;
}
export async function igprofile(igprofileargs: igprofileinterface) {
    const username = igprofileargs.args[0]
    await userInstagram(username) // Same as getUserData()
    .then(async (userData) => {
        igprofileargs.message.reply({
            embeds: [
                {
                    "title": `${userData.fullName}`,
                    "description": `${userData.biography}`,
                    thumbnail: {
                        url: `${userData.profilePicHD}`,
                    },
                    "fields": [
                        {
                            "name": "Followers",
                            "value": `${userData.subscribersCount}`,
                            "inline": true
                        },
                        {
                            "name": "Following",
                            "value": `${userData.subscribtions}`,
                            "inline": true
                        },
                        {
                            "name": "Posts",
                            "value": `${userData.postsCount}`,
                            "inline": true
                        }
                    ]
                }
            ]
        })
    })
    .catch(console.error);
}