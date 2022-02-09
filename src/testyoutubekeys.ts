const editJsonFile = require("edit-json-file");

var authconfigfile = editJsonFile(`${__dirname}/../config.json`);
var loadedAuthData = authconfigfile.get()

const requestjson = require('request-json');

var videoname = 'WMweEpGlu_U'

loadedAuthData.config.youtubeApiKeysDaemon.forEach(async (eachApiKey) => {
    console.log(eachApiKey)
    
    var success = false

    const pathForYtRequest = "https://youtube.googleapis.com/youtube/v3/videos?part=snippet,statistics,status,liveStreamingDetails&id=" + videoname + "&key=" + eachApiKey;

    var youtubeclient = requestjson.createClient('https://youtube.googleapis.com/');

    

  await  youtubeclient.get(pathForYtRequest, async function (err, res, body) {
        if (err) {
            success = false
        }

        if (body.items) {
            if (body.items[0].snippet.title) {
                success = true
            }
        }



        console.log(`${success} | ${eachApiKey}`)

        if (!success) {
            console.log(err)
            console.log(body)
        }
    })
})