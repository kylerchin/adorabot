const jsdom = require('jsdom');
var dom = new jsdom.JSDOM();
var window = dom.window;
var document = window.document;

var StatsD = require('hot-shots');
var dogstatsd = new StatsD();

var $ = require('jquery')(window);
console.log('version:', $.fn.jquery)

function runPoll(url,ddcatagory) {
$.get(url,  // url
    async function (data, textStatus, jqXHR) {  // success callback
        //alert('status: ' + textStatus + ', data:' + data);
        var output1 = data.slice(106,-112);
        console.log(output1);
        //document.getElementById("parse").innerHTML = output1;

        var $content = $(output1);
        nameArray = []
        scoreArray = []

       $content.each( function () {
        //console.log("hi");
        
        $(this).find(".pds-answer-text").each(function (i,row) {
          var nameAnswer = row.innerHTML
        console.log(nameAnswer)
      nameArray.push(nameAnswer)
      })

      $(this).find(".pds-feedback-per").each(function (i,row) {
        var scoreAnswer = row.innerHTML.replace("&nbsp;","")
      //console.log(nameAnswer)
    scoreArray.push(scoreAnswer)
    })
        })

        //output now
        var pollindex = 0;
        var poll2index = 0;

        var pollResultToDiscord = "";

        var pollResultsFinalArray = []

        nameArray.forEach(message => {
          //var nextLinePoll = nameArray[pollindex] + " : " + scoreArray[pollindex]
         // pollResultsFinalArray.push(nextLinePoll)
          //

          datadogValue = "bbps."  + ddcatagory + "." + nameArray[pollindex].replace(" ","").replace("\\\"","").replace("\\\"","").replace("[","").replace("]","").replace(" ","").replace(":","").replace(",","").replace(",","").replace(",","").replace(" ","").replace(" ","").replace(" ","").replace(" ","").replace(" ","").replace(" ","").replace(" ","").replace(" ","").replace(".","").replace(".","").replace(".","").replace(" ","").replace(" ","").replace(" ","").replace("#","").replace(" ","").replace("*","").replace("-","").replace("-","")
          datadogScore = parseFloat(scoreArray[pollindex].replace("%",""))

          dogstatsd.gauge(datadogValue, datadogScore);
          console.log(datadogValue + ":" + datadogScore )

          
          pollindex = pollindex + 1;
        });

     // var regexNames = new RegExp("<span class=\"pds-answer-text\">(\s|\S)*?</span>", "g")
      //var regexPollPer = new RegExp("<span class=\"pds-feedback-per\">(\\s|\\S)*?</span>", "g")

      //console.log(regexNames)

      //nameArray = [...output1.matchAll(regexNames)]
      //scoreArray = [...output1.matchAll(regexPollPer)]

//        console.log(nameArray[0],scoreArray[0])

//console.log(nameArray.length)

//console.log(nameArray[1])

      /*
        $content.('.pds-answer-text').each(function (i, row)
          {
              
              var pollcatagory =  row.innerHTML
              console.log(pollcatagory)
              nameArray.push(pollcatagory)
          })
$content.$('.pds-question-top').each(function (i, row)
          {
              var polltitle = "Billboard Poll:" + " What’s your favorite boy band of all time?"
                
          })
          scoreArray = []
          $('.pds-feedback-per').each(function (i, row)
          {
                var pollscore = row.innerHTML.replace("&nbsp;", "").replace("%", "")
                console.log(pollscore)
              scoreArray.push(pollscore)
              //shuffleArray(scoreArray);
          })
          console.log()
*/
        });

      }


        runPoll("https://polls.polldaddy.com/vote-js.php?p=10581243","favboyband");
        runPoll("https://polls.polldaddy.com/vote-js.php?p=10522566","2020albumbinge");
        runPoll("https://polls.polldaddy.com/vote-js.php?p=10573577","potential2020mtvvmasperformance");
        runPoll("https://polls.polldaddy.com/vote-js.php?p=10739243","whoshouldperformatasuperbowl2022");
        runPoll("https://polls.polldaddy.com/vote-js.php?p=10584893","whodeservestowinalbumoftheyearatthe2021grammys")
