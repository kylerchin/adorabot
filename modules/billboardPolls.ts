const jsdom = require('jsdom');
var dom = new jsdom.JSDOM();
var window = dom.window;
var document = window.document;

var $ = require('jquery')(window);
console.log('jquery version:', $.fn.jquery)

export function billboardVote(msg,args) {
    var precurserpoll = "Remember to vote on a different browser, device, incognito mode, or clear cookies! The bot won't let you vote as the same cookie session. If you see \"Thank you, we have counted your vote\", you are repeat voting and your new vote is not counted!\n"
    
    if (args[0]) {
      if (args[0] === "1") {
        msg.channel.send(precurserpoll + "https://www.billboard.com/articles/columns/pop/9420280/favorite-boy-band-of-all-time-poll")
      } else {
        if (args[0] === "2") {
          msg.channel.send(precurserpoll + "https://www.billboard.com/articles/columns/pop/9418334/favorite-boy-band-album-poll")
        } else {
          msg.channel.send("Select Poll to Vote:\n" + 
      "`a! bv 1`: \"What's Your Favorite Boy Band of All Time?\"\n" + 
      "`a! bbp 2` : \"What's Your Favorite Boy Band Album from the Past 30 Years?\"\n" + 
      "*more polls coming soon, go bug kyler lmao*")
        }
      }
    } else {
      msg.channel.send("Select Poll to Vote:\n" + 
      "`a! bv 1`: \"What's Your Favorite Boy Band of All Time?\"\n" + 
      "`a! bbp 2` : \"What's Your Favorite Boy Band Album from the Past 30 Years?\"\n" + 
      "*more polls coming soon, go bug kyler lmao*")
    }
}

export function billboardPollGetValue(msg,args) {
    if(args[0]) {
    
        var nameArray = []
      var scoreArray = []

      var polllink = "";

      if (args[0] === "1") {
        polllink = "https://polls.polldaddy.com/vote-js.php?p=10581243"
      } else {
        if (args[0] === "2") {
          polllink = "https://polls.polldaddy.com/vote-js.php?p=10580016"
        } else {
          msg.channel.send("We didn't get a valid link!")
          msg.channel.send("**Choose from the following polls**\n" +
          "`a! bbp 1` : \"What's Your Favorite Boy Band of All Time?\"\n" + 
          "`a! bbp 2` : \"What's Your Favorite Boy Band Album from the Past 30 Years?\"\n" + 
          "**Command: `a! bbp <poll-number> <how-many-top-results>`**")
        }
        }

      if (polllink.length > 1) {
  $.get(polllink,  // url
    async function (data, textStatus, jqXHR) {  // success callback
        //alert('status: ' + textStatus + ', data:' + data);
        var output1 = data.slice(106,-112);
        console.log(output1);
        //document.getElementById("parse").innerHTML = output1;

        var $content = $(output1);
        nameArray = []


       $content.each( function () {
        
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
          var nextLinePoll = nameArray[pollindex] + " : " + scoreArray[pollindex]
          pollResultsFinalArray.push(nextLinePoll)
          pollindex = pollindex + 1;
        });

        if (args[1]) {
          console.log("Argument exists")
          pollResultsFinalArray = pollResultsFinalArray.slice(0, parseInt(args[1],10))
        }
        else {
          console.log("No argument")
        }

        pollResultsFinalArray.forEach(message => {
          pollResultToDiscord = pollResultToDiscord + message + "\n"
          poll2index = poll2index + 1;
        });
      
        msg.channel.send(pollResultToDiscord);

console.log(nameArray.length)

console.log(nameArray[1])

        });
      }

      } else {
        msg.channel.send("**Choose from the following polls**\n" +
        "`a! bbp 1` : \"What's Your Favorite Boy Band of All Time?\"\n" + 
        "`a! bbp 2` : \"What's Your Favorite Boy Band Album from the Past 30 Years?\"\n" +
        "**Command: `a! bbp <poll-number> <how-many-top-results>`**")
      }
}