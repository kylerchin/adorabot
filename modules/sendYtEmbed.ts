const requestjson = require('request-json');

// Exporting the class which will be 
// used in another file 
// Export keyword or form should be 
// used to use the class  
  
    // Class method which prints the 
    // user called in another file 
export async function sendYtCountsEmbed(id,message,apikey) { 

        const pathForYtRequest = "https://youtube.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=" + id + "&key=" + apikey

        var youtubeclient = requestjson.createClient('https://youtube.googleapis.com/');
      
        youtubeclient.get(pathForYtRequest, function(err, res, body) {

            const videostats = body.items[0].statistics;
  
            const embedYtStats = {
              "embed": {
                "url": "https://youtube.com/watch?v=" + body.items[0].id,
                "color": 16711680,
                "timestamp": Date.now(),
                "footer": {
                  "text": "Drink water uwu <3 #BLM #ACAB"
                },
                "thumbnail": {
                  "url": body.items[0].snippet.thumbnails.default.url
                },
                "author": {
                  "name": body.items[0].snippet.title,
                  "url": "https://youtube.com/watch?v=" + body.items[0].id
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
            }
  
            message.channel.send(embedYtStats)
  
            return console.log(body);
  
          });

    } 