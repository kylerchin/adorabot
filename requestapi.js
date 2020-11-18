const pathForYtRequest = "https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=" + "gdZLi9oWNZg" + "&key=" + "AIzaSyCTnVn387_xcuu8q0g1Cj0m0DPwLEyK0pM"

const requestjson = require('request-json');
var youtubeclient = requestjson.createClient('https://youtube.googleapis.com/');
  
youtubeclient.get(pathForYtRequest, function(err, res, body) {
  return console.log(body);
});