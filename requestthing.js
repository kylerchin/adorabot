const scrapeyoutube = require('scrape-youtube').default;

scrapeyoutube.search("dynamite").then(results => {
    // Unless you specify a type, it will only return 'video' results
    console.log(results.videos[0])
});