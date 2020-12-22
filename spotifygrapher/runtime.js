request = require('request-json');
var client = request.createClient('http://localhost:8069/');

function fetchAndStoreAlbum(albumID) {

    client.get('albumPlayCount?albumid=' + albumID, function(err, res, body) {
        console.log(body);
        
        tracksList = body.data.discs[0].tracks;

        tracksList.forEach(obj => {
            console.log(obj)
            console.log(obj.uri)
            console.log(obj.playcount + " plays")
            console.log(Date.now())
            console.log(obj.name)
        });
      });

}

//example store Map Of the soul 7
fetchAndStoreAlbum("6mJZTV8lCqnwftYZa94bXS")