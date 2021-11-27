import axios from 'axios'

export function exportDateCoolKid() {
  var dateRounded = Math.round(Date.now()/1000)
  return `<t:${dateRounded}:F> <t:${dateRounded}:R>`
}

export function getMama2021ScorePre() {
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

      var totalVotes = parseInt(webpage.match(/\$\("#totalVote"\).text\("[\d||,]*\"\)/g)[0].replace(/\$\("#totalVote"\).text\("/g,"").replace(/"\)/g,"").replace(/,/g,""),10)
    
      var objectReturn = {
        candidates: candidatesJson,
        totalVotes: totalVotes
      }

      resolve(objectReturn)
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

export async function crossUsageMamaPre(messageOrInteraction:any) {
 // messageOrInteraction.reply("Changes will keep being pushed out, join the adora support server via `a!invite` to get updates on MAMA chart command!");

        await getMama2021ScorePre()
        .then(async (mamaResult:any) => {
          var candidatesArrayDesc = mamaResult.candidates.map((eachCandidate) => {
            return `\`#${eachCandidate.RANK_NUM}\`|\`${eachCandidate.CANDIDATE_VOTE_PERCENT}\`: ${eachCandidate.ARTIST_NAME_ENG}`
          })

          messageOrInteraction.reply({
            embeds: [
              {
                thumbnail: {
                  url: "https://cdn.discordapp.com/emojis/913310844060856320"
                },
                author: {
                  "name": "[ENDED] Mama 2021 Pre-Voting Award Real Time Ranking"
                },
                title: `Total Votes: ${mamaResult.totalVotes.toLocaleString('en-US')}`,
                description: `${candidatesArrayDesc.join("\n")}\nChanges will keep being pushed out, join the adora support server via \`a!invite\` to get updates on MAMA chart command!`
              }
            ]
          })
        })
        .catch(error => {
          console.error(error)
        })
}

export async function crossUsageMamaFinals(messageOrInteraction:any) {
 // messageOrInteraction.reply("Changes will keep being pushed out, join the adora support server via `a!invite` to get updates on MAMA chart command!");

  var config:any = {
    method: 'get',
    url: 'https://mama.mwave.me/en/api/rankingDetailData.json?sectionID=3',
    headers: { 
      'Cookie': 'org.springframework.mobile.device.site.CookieSitePreferenceRepository.SITE_PREFERENCE=NORMAL; JSESSIONID=5445A4CAD399008D9AE8BEEA8CAA8270; SCOUTER=x3qrab1aj39ikj'
    }
  };

  axios(config)
  .then(async(mamaresp) => {
    var descriptionToSendArray = mamaresp.data.rankList.map(eachItem => {
      var medal = ""
      if (eachItem.RANK_NUM === 1) {
        medal = ":first_place:"
      } 
      if (eachItem.RANK_NUM === 2) {
        medal = ":second_place:"
      } 
      if (eachItem.RANK_NUM === 3) {
        medal = ":third_place:"
      } 
      return `#${eachItem.RANK_NUM}|\`${eachItem.CANDIDATE_VOTE_PERCENT}% ${eachItem.CANDIDATE_VOTE_SUM.toLocaleString('en-US')}\` ${eachItem.ARTIST_NAME_ENG} ${medal}`
    })

    
    messageOrInteraction.reply({
      embeds: [
        {
          thumbnail: {
            url: "https://cdn.discordapp.com/emojis/913310844060856320"
          },
          author: {
            "name": "Mama 2021 Voting Award Real Time Ranking"
          },
          title: `Total Votes: ${mamaresp.data.sectionVoteSum.toLocaleString('en-US')}`,
          description: `${descriptionToSendArray.join("\n")}\nChanges will keep being pushed out, join the adora support server via \`a!invite\` to get updates on MAMA chart command!\n${DateCoolKid()}`
        }
      ]
    })
  })
  .catch()
}

export async function mamaAwards2021Interaction(interaction:any) {
  crossUsageMamaFinals(interaction)
}