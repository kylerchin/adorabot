import { cassandraclient } from "./cassandraclient";
const TimeUuid = require('cassandra-driver').types.TimeUuid;
const { createCanvas, loadImage } = require('canvas')

export async function ytChart(id) {

    return new Promise(async (resolve, reject) => {
        const canvas = createCanvas(3840, 2160)
        const ctx = canvas.getContext('2d')
        const x = canvas.width / 2;

        var paddingLeft = 200;
        var paddingRight = 100;
        var paddingTop = 100;
        var paddingBottom=200;
        var canvasHeightRange = canvas.height - paddingTop - paddingBottom;
        var canvasWidthRange = canvas.width - paddingLeft - paddingRight;


        var pointSize = 9;

        function drawCoordinates(x,y){	
          //  var ctx = canvas.getContext("2d");
      
      
            ctx.fillStyle = "#41ffca"; 
          ctx.beginPath();
          ctx.arc(x, y, pointSize, 0, Math.PI * 2, true);
          ctx.fill();
      }

      function drawDotFromPercentage(xper,yper) {
          var xDrawPlace = Math.round((canvasWidthRange * xper) + paddingLeft)
          var yDrawPlace = Math.round(canvasHeightRange - (canvasHeightRange * yper) + paddingTop)
        drawCoordinates(xDrawPlace, yDrawPlace)
      }

      // [{xper: 0.1, yper:0.1}]
      function drawLineFromPercentageArray(array) {
          console.log('drawLine underlying')

        const ctxline = canvas.getContext('2d');

        ctxline.lineWidth = 7;

        ctxline.strokeStyle = "#a1a1a1";

        var hasStartedPoint = false

          array.forEach((point) => {
            var xDrawPlace = Math.round((canvasWidthRange * point.xper) + paddingLeft)
            var yDrawPlace = Math.round(canvasHeightRange - (canvasHeightRange * point.yper) + paddingTop)
            if (hasStartedPoint === false) {
                ctxline.moveTo(xDrawPlace,yDrawPlace);
                hasStartedPoint = true;
            } else {
                ctxline.lineTo(xDrawPlace,yDrawPlace);
            }

          })

          ctxline.stroke()
      }
    
        var queryVideo = "SELECT * FROM adorastats.ytvideostats WHERE videoid = ?"
        var paramsVideo = [id]

        const options = {fetchSize: 2000, prepare : true };

         // Stream ended, there aren't any more rows
         ctx.fillStyle = "#282828";
         ctx.fillRect(0, 0, canvas.width, canvas.height);
         
             
             //return bufferinfo;

            var leastAndGreatestObject = {
                leastTime: null,
                greatestTime: null,
                leastViews: null,
                greatestViews: null
            }
            var numberOfRows = 0;

            var arrayOfStats = []

            function leastAndGreatestCheck(x,leastX,greatestX) {
                if ( leastAndGreatestObject[leastX] === null) {
                    console.log('set least X')
                    leastAndGreatestObject[leastX] = x
                } else {
                    if (x <  leastAndGreatestObject[leastX]) {
                        leastAndGreatestObject[leastX] = x
                    }
                }

                if ( leastAndGreatestObject[greatestX] === null) {
                    leastAndGreatestObject[greatestX] = x
                } else {
                    if (x >  leastAndGreatestObject[greatestX]) {
                        leastAndGreatestObject[greatestX] = x
                    }
                }
            }

        cassandraclient.stream( queryVideo, paramsVideo)
  .on('readable', function () {
    // 'readable' is emitted as soon a row is received and parsed
    let row;
    while (row = this.read()) {
        numberOfRows += 1;

        //  console.log(row)
          //console.log(result)
         var time = row.time.getDate().getTime()
         leastAndGreatestCheck(time, "leastTime","greatestTime")
          var views = row.views
          leastAndGreatestCheck(views,"leastViews","greatestViews")

          arrayOfStats.push({
              unixtime: time,
              views: views
          })
    }
  })
  .on('end', function () {
    // Stream ended, there aren't any more rows
    if (numberOfRows === 0) {
        // Write "Not Enough Data"
        ctx.fillStyle = "#ffffff"; 
        ctx.font = '100px Helvetica'
       // ctx.rotate(0.1)
       ctx.textAlign = 'center';
        ctx.fillText('Not enough data\nto render this chart.', x, 500)
    } else {
        console.log('leastTime',  leastAndGreatestObject['leastTime'])
        console.log('greatestTime',  leastAndGreatestObject['greatestTime'])
        console.log('numberOfRows', numberOfRows)
      
          var timeRange =  leastAndGreatestObject['greatestTime'] -  leastAndGreatestObject['leastTime']; 
          var viewRange =  leastAndGreatestObject['greatestViews'] -  leastAndGreatestObject['leastViews']; 
          
        var connectingline = arrayOfStats.map((stat) => {
            var percentageOffsetFromLeft = (stat.unixtime -  leastAndGreatestObject['leastTime'])/timeRange;
              var percentageOffsetFromBottomViews = (stat.views -  leastAndGreatestObject['leastViews'])/viewRange;
            return {
                xper: percentageOffsetFromLeft,
                yper: percentageOffsetFromBottomViews
            }
        })
        drawLineFromPercentageArray(connectingline)

          arrayOfStats.forEach(stat => {
              var percentageOffsetFromLeft = (stat.unixtime -  leastAndGreatestObject['leastTime'])/timeRange;
              var percentageOffsetFromBottomViews = (stat.views -  leastAndGreatestObject['leastViews'])/viewRange;
              drawDotFromPercentage(percentageOffsetFromLeft,percentageOffsetFromBottomViews)
          })

          //now draw legends
          const ctxlegend = canvas.getContext('2d')
          ctxlegend.strokeStyle = "#c1c1c1";

          //y axis
          ctxlegend.moveTo(paddingLeft,paddingTop);
          ctxlegend.lineTo(paddingLeft,canvas.height-paddingBottom)
          ctxlegend.stroke()
          //x axis
          ctxlegend.moveTo(paddingLeft,canvas.height-paddingBottom);
          ctxlegend.lineTo(canvas.width-paddingRight,canvas.height-paddingBottom)
          ctxlegend.stroke()
    }



  const bufferinfo = canvas.toBuffer()
        console.log(bufferinfo)
  resolve(bufferinfo)
  })
  .on('error', function (err) {
    // Something went wrong: err is a response error from Cassandra
    console.log(err)
    reject(err)
  });
 
      });
    
  
}