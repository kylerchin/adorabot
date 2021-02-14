const jsdom = require('jsdom');
var dom = new jsdom.JSDOM();
var window = dom.window;
var document = window.document;

var $ = require('jquery')(window);
console.log('jquery version:', $.fn.jquery)
const editJsonFile = require("edit-json-file");

const forEach = require("for-each")

// If the file doesn't exist, the content will be an empty object by default.
let billboardPollsDirectory = editJsonFile(`billboardPolls.json`);

async function bvHelpPage(msg) {

  var pollsListFetchVote = billboardPollsDirectory.get()

  var pollMenuBV  = ""

  //Creates list of polls as menu to choose from
  forEach(pollsListFetchVote.pollsList, function (pollValueFirst, pollKey, pollObject) {
    pollMenuBV = pollMenuBV + "`a! bv " + pollValueFirst.id + "` : \"" + pollValueFirst.title + "\"\n"
  })

  msg.channel.send("Select Poll to Vote:\n" + 
  pollMenuBV +
  "*more polls coming soon, go bug kyler lmao*")
}

export function billboardVote(msg,args) {
    var precurserpoll = "Remember to vote on a different browser, device, incognito mode, or clear cookies! The bot won't let you vote as the same cookie session. If you see \"Thank you, we have counted your vote\", you are repeat voting and your new vote is not counted!\n"

    if (args[0]) {

      //fetch json
      var billboardPollMenu = billboardPollsDirectory.get()
      //for each item in pollsList Object, check if args[0] === id,
      // if id matches, paste link
      //if nothing matches, bvHelpPage(msg)

      var pollsListFetch = billboardPollsDirectory.get()

      forEach(pollsListFetch.pollsList, function (pollValue, pollKey, pollObject) {
        console.log(args[0] + "args 0")
        //console.log(pollKey)
        //console.log(pollValue)
        console.log("id poll" + pollValue.id)

        if(args[0] === pollValue.id) {
          var pollfmlink = pollValue.polldaddy
          console.log(pollfmlink)
          msg.reply(precurserpoll + "\n" + pollfmlink)
        }

      })
      }
     else {
     bvHelpPage(msg)
    }
}

export function billboardPollGetValue(msg,args) {

  var pollsListFetch = billboardPollsDirectory.get()

    //Creates list of polls as menu to choose from
    var textStringPolls = ""
    forEach(pollsListFetch.pollsList, function (pollValueFirst, pollKey, pollObject) {
      textStringPolls = textStringPolls + "`a! bbp " + pollValueFirst.id + "` : \"" + pollValueFirst.title + "\"\n"
    })


    if(args[0]) {

      console.log("peanut butter")
    
        var nameArray = []
      var scoreArray = []

      var polllink = "";

      var foundPollInDatabase = false;

      var pollsListFetch = billboardPollsDirectory.get()

      console.log(pollsListFetch)

      forEach(pollsListFetch.pollsList, function (pollValue, pollKey, pollObject) {
        console.log(args[0] + "args 0")
        //console.log(pollKey)
        //console.log(pollValue)
        console.log("id poll" + pollValue.id)

        if(args[0] === pollValue.id) {
          polllink = "https://polls.polldaddy.com/vote-js.php?p=" + pollValue.polldatabase
          console.log(polllink)
          console.log(pollValue.title)
          foundPollInDatabase = true
        }

      })

      if (foundPollInDatabase === false) {
        
        
          msg.channel.send("We didn't get a valid link!")
          msg.channel.send("**Choose from the following polls**\n" +
          textStringPolls +
          "**Command: `a! bbp <poll-number> <how-many-top-results>`**")
          

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
      
        msg.reply(pollResultToDiscord);

console.log(nameArray.length)

console.log(nameArray[1])

        });
      }

      } else {
        msg.reply("**Choose from the following polls**\n" +
        textStringPolls + 
        "**Command: `a! bbp <poll-number> <how-many-top-results>`**")
      }
}