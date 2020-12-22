const editJsonFile = require("edit-json-file");
 
// If the file doesn't exist, the content will be an empty object by default.
let file = editJsonFile(`-5q5mZbe3V8.json`);


//console.log(file.get())

videoStats = file.get().stats
   //console.log(Object.keys(videoStats))

   var statArray = Object.keys(videoStats)

   //console.log(statArray)

    function myFunction() {
        console.log("a")
    }

    Object.keys(videoStats).forEach(function(item) {console.log(item);
    file.set("stats." + item + ".time", parseInt(item))
    })

   // Save the data to the disk
file.save();