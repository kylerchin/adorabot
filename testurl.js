function convertUrlToVideoId(ytquery) {
    if (ytquery.match(/youtube.com\/shorts\//g)) {
        console.log('match')
        var precurser = ytquery.replace("?feature=share","").replace(/youtube.com\/shorts\//g, "youtube.com/watch?v=")
    } else {
             // Valid url
    if (ytquery.includes("youtu.be/")) {
        var precurser = ytquery.replace("youtu.be/", "www.youtube.com/watch?v=")
    } else {
        var precurser = ytquery
    }
    }
    
    console.log(precurser)
    return precurser;
}

convertUrlToVideoId("https://www.youtube.com/shorts/lt-YtEvk6Vs")