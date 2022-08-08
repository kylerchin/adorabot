

import axios from 'axios';

const  {config} = require('./config.json');
  

       

        function testfunction(category, list) {

            var statuses = {}

           list.forEach((key, keyIndex) => {

                statuses["daemon" + keyIndex] = "Loading...";
      
              });

           list.forEach(async (key, keyIndex) => {

                const pathForYtRequest = "https://youtube.googleapis.com/youtube/v3/videos?part=statistics&id=hr-325mclek&key=" + key;
      
                await axios.get(pathForYtRequest)
                .then(async (response:any) => {
      
                    //console.log(response.data)

                 const body = response.data;
      
                 if (body.items) {
                    if (body.items[0].statistics) {
                      statuses[category + keyIndex] = "Success";
                      
                  //console.log(body);
                    } else {
                      statuses[category+ keyIndex] = "No stats";
                      
                  //console.log(body);
                    }
                 } else {
                  
                  statuses[category + keyIndex] = "No items found";
                 // console.log(body);
      
                 }
                  
                }).catch((error:any) => {

                    console.log(error);
                    
                statuses[category + keyIndex] = "Failed! Catch axios";

                console.log('broken key is', list[keyIndex])
      
           
                });
      
                
                console.log(statuses);
      
              });
      
        }
      
        testfunction("daemon",  config.youtubeApiKeysDaemon);
        testfunction("user",  config.youtubeApiKeys);