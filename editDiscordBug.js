var fs = require('fs');

function readWriteAsync() {
  fs.readFile('node_modules/discord.js/src/structures/BaseGuild.js', 'utf-8', function(err, data){
    if (err) throw err;

    var newValue = data.replace(/get nameAcronym\(\) {/gim, "get nameAcronym() {\nif(!(this.name)) {return ''}");

    fs.writeFile('node_modules/discord.js/src/structures/BaseGuild.js', newValue, 'utf-8', function (err) {
      if (err) throw err;
      console.log('filelistAsync complete');
    });
  });
}

readWriteAsync();

