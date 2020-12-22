
const editJsonFile = require("edit-json-file");
 
// If the file doesn't exist, the content will be an empty object by default.
let file = editJsonFile(`-5q5mZbe3V8.json`);

//console.log(file.get())

videoStats = file.toObject().stats
   //console.log(Object.keys(videoStats))

   var statArray = Object.keys(videoStats)

   //console.log(statArray)

    function myFunction() {
        console.log("a")
    }

    const fs = require('fs');

fs.appendFileSync('test.csv', '#time,views,likes,dislikes,comments\n');

    function linksOfPics(obJect){
        Object.keys(obJect).forEach(function(x){
            console.log(obJect[x]);
            fs.appendFileSync('test.csv', obJect[x].time + "," + obJect[x].viewCount + "," + obJect[x].likeCount + "," + obJect[x].dislikeCount + "," + obJect[x].commentCount + "\n");
        });
        }

   // console.log(videoStats)

    console.log(typeof videoStats)

    linksOfPics(videoStats)
   // file.set("stats." + item + ".time", parseInt(item))
  
   // console.log('successfully appended "' + text + '"');
    

   // Save the data to the disk