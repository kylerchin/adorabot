const axios = require('axios');

const cheerio = require('cheerio');
var chartid = "billboard-korea-100"

axios.get("https://www.billboard.com/charts/" + chartid)
.then(async (response) => {
   // console.log(response.data);
   const $ = cheerio.load(response.data);
   
  var rowsoftable =  $('.o-chart-results-list-row').html()

  //console.log(rowsoftable)

 if (rowsoftable) {
   // console.log(rowsoftable[0])

    var arrayofhtml = $('.o-chart-results-list-row').toArray().map((x) => { return $(x).html()});

    //console.log(rowsoftable)
    var arrayofresults = arrayofhtml.map((eachitem) => {
        const bbcheeriorow = cheerio.load(eachitem);

        var obj = {
            rank: bbcheeriorow('.lrv-u-background-color-black > .c-label').html().replace(/\n/g,'').replace(/\t/g,''),
            cover: bbcheeriorow('.c-lazy-image__img').attr('src')
        }

        var titlefetch = bbcheeriorow('.c-title')

        if (titlefetch) {
            obj.title = titlefetch.html().replace(/\n/g,'').replace(/\t/g,'')
        }

        var artistfetch = bbcheeriorow('.lrv-u-flex-grow-1 > .c-label')

        if (artistfetch) {
            if (artistfetch.html()) {
                obj.artist = artistfetch.html().replace(/\n/g,'').replace(/\t/g,'')
            }
           
        }

     return obj
    })
 
    console.log(arrayofhtml.length)

    console.log(arrayofresults[0])
    console.log(arrayofresults[20])

    //c-lazy-image__img
 }
   
}).catch(error => {console.error(error)})