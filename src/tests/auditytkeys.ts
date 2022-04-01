const editJsonFile = require("edit-json-file");

var authconfigfile = editJsonFile(`${__dirname}/../../config.json`);


var loadedAuthData = authconfigfile.get()

if (loadedAuthData.config.youtubeApiKeysDaemon) {
    loadedAuthData.config.youtubeApiKeysDaemon.forEach((eachKey) => {
      
        const firstPartOfPath = "https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=" 

        const pathForYtRequest = firstPartOfPath + row.videoid + "&key=" + theRandomApiKey

        var youtubeclient = requestjson.createClient('https://youtube.googleapis.com/');

       axios.
    })
}