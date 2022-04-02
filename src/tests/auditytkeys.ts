import editJsonFile from 'edit-json-file';
import requestjson from 'request-json';

var authconfigfile = editJsonFile(`${__dirname}/../../config.json`);

const testid = "WMweEpGlu_U"

var loadedAuthData = authconfigfile.get()

if (loadedAuthData.config.youtubeApiKeysDaemon) {
    loadedAuthData.config.youtubeApiKeysDaemon.forEach((eachKey) => {
      
        const firstPartOfPath = "https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=" 

        const pathForYtRequest = firstPartOfPath + testid + "&key=" + eachKey

        var youtubeclient = requestjson.createClient('https://youtube.googleapis.com/');

        youtubeclient.get(pathForYtRequest, async function(err, res, body) {

            console.log(eachKey, body)

            if (err) {
                console.log(eachKey, err)
            }

        });
    })
}