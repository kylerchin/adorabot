import axios from 'axios'

export function getMama2021Score() {
   return new Promise(async (resolve, reject) => {
    var config:any = {
        method: 'get',
        url: 'https://mama.mwave.me/en/preVoteResult',
        headers: { 
          'Cookie': 'org.springframework.mobile.device.site.CookieSitePreferenceRepository.SITE_PREFERENCE=NORMAL; JSESSIONID=5445A4CAD399008D9AE8BEEA8CAA8270; SCOUTER=x3qrab1aj39ikj'
        }
      };
      
      axios(config)
  .then(function (response) {
    // handle success
    console.log(response);

    console.log(response.data)

    var webpage = response.data;

    var arrayOfMatchingCan = webpage.match(/var candidates = \[([^\]])*\]/g)

    if (arrayOfMatchingCan) {
      var isolatedString:any = arrayOfMatchingCan[0].replace(/var candidates = /g,"").replace(/\n/g,"").replace(/(?<=[^\\])'/g,'"').replace(/\\\'/g,'\\\\\'')

      console.log('isolatedString', isolatedString)

      var candidatesJson = JSON.parse(isolatedString)

      console.log(candidatesJson)
    }
 else {
   reject("nothing found")
 }
 
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
      });
      
}