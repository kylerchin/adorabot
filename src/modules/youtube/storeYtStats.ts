const requestjson = require('request-json');
const editJsonFile = require("edit-json-file");
var fs = require('fs');

// Exporting the class which will be 
// used in another file 
// Export keyword or form should be 
// used to use the class  
  
    // Class method which prints the 
    // user called in another file 
export async function storeYoutubeDataIntoDatabase(body) { 

            const videostats = body.items[0].statistics;

            const currentDateObject = new Date();
            const datejsonmonth = currentDateObject.getMonth() + 1;
            const datejsonyear = currentDateObject.getFullYear()
            const datejsondate = currentDateObject.getDate()

            const datejsonputtogether = datejsonyear + "-" + datejsonmonth + "-" + datejsondate

            
var dir = `./youtube/stats/videos/${body.items[0].id}`;

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
// If the file doesn't exist, the content will be an empty object by default.
  var file = editJsonFile(`./youtube/stats/videos/${body.items[0].id}/${datejsonputtogether}.json`);

  // If the file doesn't exist, the content will be an empty object by default.
  var indexOfVideo = editJsonFile(`./youtube/stats/videos/${body.items[0].id}/index.json`);

var currentTime = Date.now()

  // Set a couple of fields
  file.set("id", body.items[0].id)
  file.set("stats."+currentTime+".time", Date.now());
  file.set("stats."+currentTime+".viewCount", videostats.viewCount);
  file.set("stats."+currentTime+".likeCount", videostats.likeCount);
  file.set("stats."+currentTime+".dislikeCount", videostats.dislikeCount);
   file.set("stats."+currentTime+".commentCount", videostats.commentCount);

   indexOfVideo.set("latestFileSet", `${datejsonputtogether}.json`)

 
// Save the data to the disk
file.save();
indexOfVideo.save()
 
  
  
           


    } 