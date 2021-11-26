import axios from 'axios'

export function getMama2021Score() {
   return new Promise(async (resolve, reject) => {
        axios.get('https://mama.mwave.me/en/preVoteResult')
  .then(function (response) {
    // handle success
    console.log(response);
    resolve(response)
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
      });
      
}