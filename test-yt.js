

const {google} = require('googleapis');
 
// Each API may support multiple version. With this sample, we're getting
// v3 of the blogger API, and using an API key to authenticate.
const youtube = google.youtube({
  version: 'v3',
  auth: 'AIzaSyCTnVn387_xcuu8q0g1Cj0m0DPwLEyK0pM'
});