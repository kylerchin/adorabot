const { Worker } = require('worker_threads')
import * as path from 'path';
import { cassandraclient } from "../cassandraclient";
import {logger, tracer} from "../logger"
import {dogstatsd} from '../dogstats'
import { resolve } from 'path';
const TimeUuid = require("cassandra-driver").types.TimeUuid;
const { createCanvas, registerFont, loadImage } = require("canvas");
const editJsonFile = require("edit-json-file");
var importconfigfile = editJsonFile(`${__dirname}/../../removedytvids.json`);
registerFont(
  path.resolve(__dirname, "../../LexendDecaMedium.ttf")
  , {
      family: "Lexend Deca",
  });

var arrayOfMonthsEnglishShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

interface optionsInterface {
  channelId?: string;
  [key: string]: any;
  addOnPoints?: AddOnPointsEntity[] | null;
  publishedAt?: Date;
}

interface AddOnPointsEntity {
  views: number;
  time: number;
  comments?: number | null | undefined;
  likes?: number;
  dislikes?: number;
}
export async function ytChart(id, optionsObject: optionsInterface) {
  var beginningTime = Date.now()
  if (false) {
    return new Promise(async (resolve, reject) => {
      const worker = new Worker(path.resolve(__dirname, "workerYtChart.js"), { id, optionsObject });
      worker.on('message', (message) => {
        console.log('outmsg',message)
        resolve(message);
        dogstatsd.histogram('adorabot.ytchart.chartdrawtimehist', Date.now() - beginningTime);
      });
      worker.on('error', (error) => {
        console.error(error)
        reject(error)
      });
      worker.on('exit', (code) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      })
    });
  }


  //non worker system
  if (true) {
    return new Promise(async (resolve, reject) => {

const canvas = createCanvas(3840, 2160);
const ctx = canvas.getContext("2d");
const ctxLegendXLabel = canvas.getContext("2d");
const x = canvas.width / 2;

const phi = 1.618033988749895;

var legendDepth = 100;
var legendDepthSub = 60;

const paddingLeft = 200;
const paddingRight = 100;
const paddingTop = 100;
const paddingBottom = 200;
const canvasHeightRange = canvas.height - paddingTop - paddingBottom;
const canvasWidthRange = canvas.width - paddingLeft - paddingRight;

var pointSize = 9;
var markerLineWidth = 10;

const twopi = Math.PI * 2;

function drawCoordinates(x, y) {
    //  var ctx = canvas.getContext("2d");

    ctx.fillStyle = "#41ffca";
    ctx.beginPath();
    ctx.arc(x, y, pointSize, 0, twopi, true);
    ctx.fill();
}

function drawSquareCoordinates(x,y) {
    ctx.fillStyle = "#41ffca";
    ctx.fillRect(x - 3, y - 3, 6, 6);
}

function drawDotFromPercentage(xper, yper) {
    var xDrawPlace = Math.round(canvasWidthRange * xper + paddingLeft);
    var yDrawPlace = Math.round(
        canvasHeightRange - canvasHeightRange * yper + paddingTop
    );
    drawCoordinates(xDrawPlace, yDrawPlace);
}

function drawSquareFromPercentage(xper, yper) {
    var xDrawPlace = Math.round(canvasWidthRange * xper + paddingLeft);
    var yDrawPlace = Math.round(
        canvasHeightRange - canvasHeightRange * yper + paddingTop
    );
    drawSquareCoordinates(xDrawPlace, yDrawPlace);
}

// [{xper: 0.1, yper:0.1}]
function drawLineFromPercentageArray(array) {
    console.log("drawLine underlying");

    const ctxline = canvas.getContext("2d");

    ctxline.lineWidth = 9;

    ctxline.strokeStyle = "#a1a1a1";

    var hasStartedPoint = false;

    ctxline.beginPath();

    array.forEach((point) => {
        var xDrawPlace = Math.round(
            canvasWidthRange * point.xper + paddingLeft
        );
        var yDrawPlace = Math.round(
            canvasHeightRange - canvasHeightRange * point.yper + paddingTop
        );
        if (hasStartedPoint === false) {
            ctxline.moveTo(xDrawPlace, yDrawPlace);
            hasStartedPoint = true;
        } else {
            ctxline.lineTo(xDrawPlace, yDrawPlace);
        }
    });

    ctxline.stroke();
    ctxline.closePath();
}

var queryVideo =
    "SELECT * FROM adorastats.ytvideostats WHERE videoid = ?";
var paramsVideo = [id];

const options = { fetchSize: 2000, prepare: true };

// Stream ended, there aren't any more rows
ctx.fillStyle = "#282828";
ctx.fillRect(0, 0, canvas.width, canvas.height);
//return bufferinfo;

var leastAndGreatestObject = {
    leastTime: null,
    greatestTime: null,
    leastViews: null,
    greatestViews: null,
};
var numberOfRows = 0;

var arrayOfStats = [];

function leastAndGreatestCheck(x, leastX, greatestX) {
    if (leastAndGreatestObject[leastX] === null) {
        console.log("set least X");
        leastAndGreatestObject[leastX] = x;
    } else {
        if (x < leastAndGreatestObject[leastX]) {
            leastAndGreatestObject[leastX] = x;
        }
    }

    if (leastAndGreatestObject[greatestX] === null) {
        leastAndGreatestObject[greatestX] = x;
    } else {
        if (x > leastAndGreatestObject[greatestX]) {
            leastAndGreatestObject[greatestX] = x;
        }
    }
}

cassandraclient
    .stream(queryVideo, paramsVideo)
    .on("readable", function () {
        // 'readable' is emitted as soon a row is received and parsed
        let row;
        while ((row = this.read())) {
            numberOfRows += 1;

            //  console.log(row)
            //console.log(result)
            var time = row.time.getDate().getTime();
            leastAndGreatestCheck(time, "leastTime", "greatestTime");
            // console.log("views", row.views)
            var views = parseInt(row.views.toString());
            leastAndGreatestCheck(views, "leastViews", "greatestViews");

            arrayOfStats.push({
                unixtime: time,
                views: views,
            });
        }
    })
    .on("end", function () {
      var cassandratimedone = Date.now()
        if (optionsObject.addOnPoints) {
            optionsObject.addOnPoints.forEach((eachPoint) => {
                numberOfRows += 1;

                var addontime = eachPoint.time;
                leastAndGreatestCheck(addontime, "leastTime", "greatestTime");
                // console.log("views", row.views)
                var addonviews = eachPoint.views;
                leastAndGreatestCheck(addonviews, "leastViews", "greatestViews");

                if (optionsObject.publishedAt) {
                    if (leastAndGreatestObject["leastTime"] < optionsObject.publishedAt.getTime() && leastAndGreatestObject["greatestTime"] > optionsObject.publishedAt.getTime()) {
                        leastAndGreatestObject["leastTime"] = optionsObject.publishedAt.getTime() - (1000 * 60)
                    }
                }


                arrayOfStats.push({
                    unixtime: addontime,
                    views: addonviews,
                });
            });
        }
        // Stream ended, there aren't any more rows
        var viewRange: number = 0;
        if (leastAndGreatestObject["greatestViews"] && leastAndGreatestObject["leastViews"]) {
            viewRange = leastAndGreatestObject["greatestViews"] -
                leastAndGreatestObject["leastViews"];
        } else {
            viewRange = 0;
        }

        var timeRange: number = 0;

        if (leastAndGreatestObject["greatestTime"] && leastAndGreatestObject["leastTime"]) {
            timeRange = leastAndGreatestObject["greatestTime"] -
                leastAndGreatestObject["leastTime"];
        }

        var loadedRemovedData = importconfigfile.get();

        var isBlocked = false;

        try {
            if (!(loadedRemovedData.removedvids.indexOf(id) == -1)) {
                isBlocked = true;
            }

            if (optionsObject.channelId) {
                if (
                    !(
                        loadedRemovedData.removedytchannels.indexOf(
                            optionsObject.channelId
                        ) == -1
                    )
                ) {
                    isBlocked = true;
                }
            }
        } catch (error) {
            console.log(error);
        }
        if (numberOfRows === 0 || viewRange < 3 || isBlocked || (leastAndGreatestObject["leastTime"] == null)) {
            // Write "Not Enough Data"
            ctx.fillStyle = "#ffffff";
            ctx.font = "200px Lexend Deca";
            // ctx.rotate(0.1)
            ctx.textAlign = "center";
            ctx.fillText(
                "Not enough data\nto render this chart.",
                x,
                canvas.height / 2 - 100
            );

            ctx.font = "70px Lexend Deca";
            const yToDrawSubtitle = canvas.height / 2 + 270;
            if (isBlocked) {
                ctx.fillText(
                    "This video / channel has been restricted from rendering a chart",
                    x,
                    yToDrawSubtitle
                );
            } else {
                ctx.fillText(
                    "This might improve in a few seconds, minutes or hours when new data is recieved from YouTube.\n Run the command again to confirm.",
                    x,
                    yToDrawSubtitle
                );
            }
        } else {
            ctx.fillStyle = "#ffffff";
            ctx.font = "150px Lexend Deca";
            // ctx.rotate(0.1)
            ctx.textAlign = "center";
            ctx.fillText(`View Count Chart`, x, 200);
            // ctx.fillText(``, x, 300)

            //var viewRange:number =  leastAndGreatestObject['greatestViews'] -  leastAndGreatestObject['leastViews'];
            //var timeRange:number =  leastAndGreatestObject['greatestTime'] -  leastAndGreatestObject['leastTime'];

            console.log("leastTime", leastAndGreatestObject["leastTime"]);
            console.log("greatestTime", leastAndGreatestObject["greatestTime"]);
            console.log("numberOfRows", numberOfRows);

            var leastTimeDateObject = new Date(
                leastAndGreatestObject["leastTime"]
            );

            var lowestDateToChart = new Date(
                Date.UTC(
                    leastTimeDateObject.getUTCFullYear(),
                    leastTimeDateObject.getUTCMonth(),
                    leastTimeDateObject.getUTCDate()
                )
            ).getTime();

            var timeLegend = lowestDateToChart;

            var pointybottom =
                canvas.height - paddingBottom + legendDepth * (1 / phi);
            var pointytop =
                canvas.height - paddingBottom - legendDepth * (1 - 1 / phi);

            var pointybottomminor =
                canvas.height - paddingBottom + legendDepthSub * (1 / phi);
            var pointytopminor =
                canvas.height - paddingBottom - legendDepthSub * (1 - 1 / phi);

            const ctxSubLegend = canvas.getContext("2d");
            ctxSubLegend.strokeStyle = "#b1b1b1";

            // timeLegend += 60 * 60 * 24 * 1000

            ctxLegendXLabel.fillStyle = "#818181";
            ctxLegendXLabel.font = "50px Lexend Deca";
            // ctx.rotate(0.1)
            ctxLegendXLabel.textAlign = "center";

            var numberOfDaysDone = 0;

            var monthsAdded = []



            while (timeLegend < leastAndGreatestObject["greatestTime"]) {

                //console.log("draw legend")
                var percxlegend =
                    (timeLegend - leastAndGreatestObject["leastTime"]) / timeRange;
                var pointx = canvasWidthRange * percxlegend + paddingLeft;
                ctxSubLegend.beginPath();
                ctxSubLegend.moveTo(pointx, pointytop);
                ctxSubLegend.lineTo(pointx, pointybottom);
                ctxSubLegend.stroke();
                ctxSubLegend.closePath();

                var daysLabelsOffsetFromBottom = 40;
                var monthsLabelsOffsetFromBottom = 25;
                var modulusForDays = 1;

                if (timeRange >= 40 * 60 * 24 * 1000 * 20) {
                    //bigger than 40 days
                    //draw Months

                    var monthCodeToWrite = `${new Date(timeLegend).getUTCMonth() + 1}월`

                    var averagePointForThisMonth = new Date(
                        Date.UTC(
                            leastTimeDateObject.getUTCFullYear(),
                            leastTimeDateObject.getUTCMonth(),
                            15,
                            leastTimeDateObject.getUTCHours()
                        )
                    ).getTime();


                    var monthref = new Date(timeLegend).getUTCFullYear() + '-' + new Date(timeLegend).getUTCMonth()
                    if (averagePointForThisMonth > leastAndGreatestObject.leastTime &&
                        averagePointForThisMonth < leastAndGreatestObject.greatestTime) {
                        if (new Date(timeLegend).getUTCDate() === 15) {
                            ctxLegendXLabel.fillText(
                                `${monthCodeToWrite}`,
                                pointx,
                                canvas.height - monthsLabelsOffsetFromBottom
                            );

                        }
                    } else {
                        var farpoint = 0;

                        if (averagePointForThisMonth < leastAndGreatestObject.leastTime) {
                            farpoint = paddingLeft;
                        } else {
                            farpoint = canvas.width - paddingRight;
                        }

                        if (!(monthsAdded.includes(monthref))) {
                            ctxLegendXLabel.fillText(
                                `${monthCodeToWrite}`,
                                farpoint,
                                canvas.height - monthsLabelsOffsetFromBottom
                            );
                            monthsAdded.push(monthref)
                        }


                    }



                }

                //more than 20 days
                if (timeRange > 60 * 60 * 24 * 1000 * 20) {
                    daysLabelsOffsetFromBottom = 80;
                    modulusForDays = 2;
                }


                //more than 40 days
                if (timeRange > 60 * 60 * 24 * 1000 * 40) {
                    modulusForDays = 3;
                }

                if (numberOfDaysDone % modulusForDays == 0) {
                    //less than 40 days
                    if (timeRange < 40 * 60 * 24 * 1000 * 20) {

                        // month and date
                        ctxLegendXLabel.fillText(
                            `${new Date(timeLegend).getUTCMonth() + 1}/${new Date(timeLegend).getUTCDate()}`,
                            pointx,
                            canvas.height - daysLabelsOffsetFromBottom
                        );

                    } else {
                        //bigger than 40 days
                        //draw only the date
                        ctxLegendXLabel.fillText(
                            `${new Date(timeLegend).getUTCDate()}`,
                            pointx,
                            canvas.height - daysLabelsOffsetFromBottom
                        );
                    }

                }

                timeLegend += 60 * 60 * 24 * 1000;
                numberOfDaysDone += 1;
            }

            //under 5 days
            var hourDerivative = 60 * 60 * 1000;

            var modulusHourInterval = 1;

            var modulusHourIntervalLabel = 2;

            // if the time window is less than 5 days, draw the hours
            if (timeRange < 5 * 60 * 60 * 24 * 1000) {
                if (timeRange < 2 * 60 * 60 * 24 * 1000) {
                    //if the time window is less than 48 hours, draw ticks every hour
                    modulusHourInterval = 1;
                } else {
                    if (timeRange < 2 * 60 * 60 * 24 * 1000) {
                        //draw ticks every 2 hours
                        modulusHourInterval = 2;
                    } else {
                        //draw ticks every 3 hrs
                        modulusHourInterval = 3;
                    }
                }

                if (timeRange < 60 * 60 * 24 * 1000) {
                    //if the time window is less than 24 hours, draw labels every hour
                    modulusHourIntervalLabel = 1;
                } else {
                    //draw labels every 2 hours
                    modulusHourIntervalLabel = 2;

                    if (timeRange < 2 * 60 * 60 * 24 * 1000) {
                        //draw ticks every 2 hours
                        modulusHourIntervalLabel = 2;
                    } else {
                        if (timeRange < 4 * 60 * 60 * 24 * 1000) {
                            //draw ticks every 3 hrs
                            modulusHourIntervalLabel = 3;
                        } else {
                            //draw ticks every 3 hrs
                            modulusHourIntervalLabel = 6;
                        }

                    }
                }
                var lowestHourToChart = new Date(
                    Date.UTC(
                        leastTimeDateObject.getUTCFullYear(),
                        leastTimeDateObject.getUTCMonth(),
                        leastTimeDateObject.getUTCDate(),
                        leastTimeDateObject.getUTCHours()
                    )
                ).getTime();
                var timeHourLegend = lowestHourToChart;

                const ctxSubMinorLegend = canvas.getContext("2d");
                ctxSubMinorLegend.strokeStyle = "#a1a1a1";
                ctxSubMinorLegend.lineWidth = markerLineWidth;
                while (timeHourLegend < leastAndGreatestObject["greatestTime"]) {
                    var utchour = new Date(timeHourLegend).getUTCHours();
                    if (utchour % modulusHourInterval === 0) {
                        if (timeHourLegend > leastAndGreatestObject["leastTime"]) {
                            var percxlegend =
                                (timeHourLegend - leastAndGreatestObject["leastTime"]) /
                                timeRange;
                            var pointx = canvasWidthRange * percxlegend + paddingLeft;

                            ctxSubMinorLegend.moveTo(pointx, pointytopminor);
                            ctxSubMinorLegend.lineTo(pointx, pointybottomminor);
                            ctxSubMinorLegend.stroke();
                            //console.log('utchours', new Date(timeHourLegend).getUTCHours())
                            if (utchour % modulusHourIntervalLabel === 0) {
                                ctxLegendXLabel.fillText(
                                    `${new Date(timeHourLegend).getUTCHours()}:00`,
                                    pointx,
                                    canvas.height - 100
                                );
                            }
                        }
                    }
                    //console.log("draw legend")

                    timeHourLegend += hourDerivative;
                }
            }

            const ctxSubYLineLegend = canvas.getContext("2d");
            ctxSubYLineLegend.strokeStyle = "#818181";

            const ctxLegendYLabel = canvas.getContext("2d");
            ctxLegendYLabel.fillStyle = "#a1a1a1";
            ctxLegendYLabel.font = "50px Lexend Deca";
            ctxLegendYLabel.textBaseline = "middle";
            // ctx.rotate(0.1)
            ctxLegendYLabel.textAlign = "left";
            // draw y axis graph
            // if (leastAndGreatestObject['greatestViews'] < (20 * 1.0e6)) {

            if (true) {
                //draw million lines
                var yAxisDrawMillions =
                    (Math.floor(leastAndGreatestObject["leastViews"] / 1.0e6) + 1) *
                    1.0e6;
                //console.log('yaxisdraw', yAxisDrawMillions)

                while (
                    yAxisDrawMillions < leastAndGreatestObject["greatestViews"]
                ) {
                    
                    var shouldDrawHorizontalLegend  = true;

                    if (viewRange > 9.0e7) {
                        if ((yAxisDrawMillions / 1.0e6) % 5 === 0) {
                        } else {
                            shouldDrawHorizontalLegend = false;
                        }
                    }

                    if (shouldDrawHorizontalLegend) {
                        // console.log('yaxisdraw', yAxisDrawMillions)
                    var percylegend =
                    (yAxisDrawMillions - leastAndGreatestObject["leastViews"]) /
                    viewRange;
                var pointy =
                    canvasHeightRange - (canvasHeightRange * percylegend) + paddingTop;
                ctxSubYLineLegend.moveTo(paddingLeft - 50, pointy);
                ctxSubYLineLegend.lineTo(canvas.width - paddingRight, pointy);
                ctxSubYLineLegend.stroke();
                    }

                    if (viewRange > 9.0e7) {
                        if ((yAxisDrawMillions / 1.0e6) % 10 === 0) {
                            ctxLegendYLabel.fillText(
                                `${yAxisDrawMillions / 1.0e6}M`,
                                30,
                                pointy
                            );
                        }
                    } else {
                        if (viewRange > 2.0e7) {
                            if ((yAxisDrawMillions / 1.0e6) % 2 === 0) {
                                ctxLegendYLabel.fillText(
                                    `${yAxisDrawMillions / 1.0e6}M`,
                                    30,
                                    pointy
                                );
                            }
                        } else {
                            ctxLegendYLabel.fillText(
                                `${yAxisDrawMillions / 1.0e6}M`,
                                30,
                                pointy
                            );
                        }
                    }


                    yAxisDrawMillions += 1.0e6;

                }
            }

            var hundredthousandint =
                (Math.floor(leastAndGreatestObject["leastViews"] / 1.0e5) + 1) *
                1.0e5;
            if (viewRange < 2.0e6) {
                console.log("view range under 2 million");
                while (
                    hundredthousandint < leastAndGreatestObject["greatestViews"]
                ) {
                    if (hundredthousandint % 1.0e6 === 0) {
                        console.log("skip cuz it's 1 million");
                    } else {
                        if (
                            hundredthousandint > leastAndGreatestObject["leastViews"]
                        ) {
                            console.log("draw 100 interval");
                            // console.log('yaxisdraw', yAxisDrawMillions)
                            var percylegend =
                                (hundredthousandint -
                                    leastAndGreatestObject["leastViews"]) /
                                viewRange;
                            var pointy =
                                canvasHeightRange -
                                canvasHeightRange * percylegend +
                                paddingTop;
                            ctxSubYLineLegend.moveTo(paddingLeft - 50, pointy);
                            ctxSubYLineLegend.lineTo(
                                canvas.width - paddingRight,
                                pointy
                            );
                            ctxSubYLineLegend.stroke();

                            var nameOfNumber = "";
                            if (hundredthousandint < 1.0e6) {
                                nameOfNumber = `${hundredthousandint / 1.0e3}K`;
                            } else {
                                nameOfNumber = `${hundredthousandint / 1.0e6}M`;
                            }
                            ctxLegendYLabel.fillText(
                                `${nameOfNumber}`,
                                30,
                                pointy
                            );
                        }
                    }
                    hundredthousandint += 1.0e5;
                }
            }

            var connectingline = arrayOfStats.map((stat) => {
                var percentageOffsetFromLeft =
                    (stat.unixtime - leastAndGreatestObject["leastTime"]) /
                    timeRange;
                var percentageOffsetFromBottomViews =
                    (stat.views - leastAndGreatestObject["leastViews"]) / viewRange;
                return {
                    xper: percentageOffsetFromLeft,
                    yper: percentageOffsetFromBottomViews,
                };
            });

            const lengthofstatsprewhiteline = arrayOfStats.length;

            const tolerance = 0.2;

            let connectinglinefilteredforwhiteline = connectingline.filter((eachDot, eachIndexWhite:number) => {
                var verdictonkeep = true;

                if (eachIndexWhite != 0 && eachIndexWhite != lengthofstatsprewhiteline -1) {
                    if (
                        Math.abs(eachDot.xper - connectingline[eachIndexWhite - 1].xper) < tolerance &&
                        Math.abs(eachDot.xper - connectingline[eachIndexWhite + 1].xper) < tolerance &&
                        Math.abs(eachDot.yper - connectingline[eachIndexWhite - 1].xper) < tolerance &&
                        Math.abs(eachDot.yper - connectingline[eachIndexWhite + 1].xper) < tolerance 
                    ) {
                        verdictonkeep = false
                }
            } else {
                if (eachIndexWhite === 0 ) {
                    if (
                    Math.abs(eachDot.xper - connectingline[eachIndexWhite + 1].xper) < tolerance &&
                    Math.abs(eachDot.yper - connectingline[eachIndexWhite + 1].xper) < tolerance ) {
                        verdictonkeep = true;
                    }
                }

                if (eachIndexWhite === lengthofstatsprewhiteline -1) {
                    if (
                    Math.abs(eachDot.xper - connectingline[eachIndexWhite - 1].xper) < tolerance &&
                    Math.abs(eachDot.yper - connectingline[eachIndexWhite - 1].xper) < tolerance ) {
                        verdictonkeep = true;
                    }
                }
            }
            return verdictonkeep = false;
        })

            if (connectinglinefilteredforwhiteline.length >= 2) {
            drawLineFromPercentageArray(connectinglinefilteredforwhiteline );
            }

            var arrayStatsLength = arrayOfStats.length;

            const offsetCalcBottom  = (views)  => {
               return (views - leastAndGreatestObject["leastViews"]) / viewRange;
            }

            const offsetCalcLeft  = (unixtime)  => {
              return (unixtime - leastAndGreatestObject["leastTime"]) / timeRange;
           }

           var drawsquare = true;

           if (arrayOfStats.length < 1000) {
            drawsquare = false;
           }

            arrayOfStats
            .map((stat) => {
              stat["fromleft"] = offsetCalcLeft(stat.unixtime);
              stat['frombot'] =  offsetCalcBottom(stat.views);

              return stat;
            })
            .forEach((stat,statIndex) => {

               
              //  var percentageOffsetFromLeft = offsetCalcLeft(stat.unixtime)
             // var percentageOffsetFromLeft = offsetCalcLeft(stat.unixtime)
              //  var percentageOffsetFromBottomViews = offsetCalcBottom(stat.views)

               var shouldDrawDot:boolean = true;

              var modulusStat = 2;

              if (arrayStatsLength > 5000) {
                modulusStat = 3;
              }

              if (arrayStatsLength > 10000) {
                modulusStat = 4;
              }

              if (arrayStatsLength > 15000) {
                modulusStat = 12;
              }

              var amountToHide = 1/3000

               if (arrayStatsLength > 3800) {
                if (statIndex != 0 && statIndex != arrayStatsLength - 1) {
                  if (statIndex % modulusStat != 0) {
                    //if neighbouring dots are under 1 pixel away
                   if (Math.abs(stat.fromleft - arrayOfStats[statIndex-1].fromleft) <amountToHide && Math.abs(stat.fromleft - arrayOfStats[statIndex+1].fromleft) < amountToHide) {
                    shouldDrawDot = false;
                   }
                  }
                }
               }

              if (shouldDrawDot === true) {
                if (drawsquare) {
                    drawSquareFromPercentage(
                        stat.fromleft,
                        stat.frombot
                    )
                } else {
                    drawDotFromPercentage(
                        stat.fromleft,
                        stat.frombot
                    );
                }
                
              }
            });


            if (optionsObject.publishedAt) {
                var publishedAtTime = optionsObject.publishedAt.getTime()
                if (publishedAtTime > leastAndGreatestObject["leastTime"] && publishedAtTime < leastAndGreatestObject["greatestTime"]) {
                    var ctxRelease = canvas.getContext('2d')
                    ctxRelease.strokeStyle = '#fce464'
                    ctxRelease.lineWidth = 15;
                    var percxreleasetime =
                        (publishedAtTime - leastAndGreatestObject["leastTime"]) /
                        timeRange;
                    var pointxreleasetime = canvasWidthRange * percxreleasetime + paddingLeft;
                    ctxRelease.beginPath();
                    ctxRelease.moveTo(pointxreleasetime, paddingTop);
                    ctxRelease.lineTo(pointxreleasetime, canvas.height - paddingBottom);
                    ctxRelease.stroke();
                    ctxRelease.closePath();

                    ctxRelease.textAlign = "right";
                    var xforreleasetext = pointxreleasetime - 80;
                    ctxRelease.font = "150px Lexend Deca";
                    if (
                        xforreleasetext < 500
                    ) {
                        ctxRelease.textAlign = "left";
                        xforreleasetext = pointxreleasetime + 80;
                    }
                    ctxRelease.fillStyle = "#fce464";
                    ctxRelease.fillText(
                        "Release Time",
                        xforreleasetext,
                        canvas.height - paddingBottom - 150
                    );


                }

            }


            //now draw legends
            var ctxlegend = canvas.getContext("2d");
            ctxlegend.strokeStyle = "#e7acc2";

            ctxlegend.beginPath();

            //y axis
            ctxlegend.moveTo(paddingLeft, paddingTop);
            ctxlegend.lineTo(paddingLeft, canvas.height - paddingBottom);
            ctxlegend.stroke();
            //x axis
            ctxlegend.moveTo(paddingLeft, canvas.height - paddingBottom);
            ctxlegend.lineTo(
                canvas.width - paddingRight,
                canvas.height - paddingBottom
            );
            ctxlegend.stroke();

            ctxlegend.closePath()
                ;

        }

        var compressionStart = Date.now()
        const bufferinfo = canvas.toBuffer("image/png", {
            compressionLevel: 1,
        });
        dogstatsd.histogram('adorabot.ytchart.chartdrawtimehist', Date.now() - beginningTime);
        dogstatsd.histogram('adorabot.ytchart.chartdrawtimecompresshist', Date.now() -compressionStart);
        dogstatsd.histogram('adorabot.ytchart.chartdrawtimedrawhist',  compressionStart - cassandratimedone);
        dogstatsd.histogram('adorabot.ytchart.chartdrawtimecassandrahist', cassandratimedone - beginningTime );
        // console.log(bufferinfo);
        console.log('chart finished drawing, time to resolve')
       resolve(bufferinfo)



        console.log('resolved chart')

    })
    .on("error", function (err) {
        // Something went wrong: err is a response error from Cassandra
        console.log(err);
        logger.discordErrorLogger.error(err, { type: 'chartmakerfail' })
      //  process.exit()
        reject(err);
        
    });
    })

    //end of non worker system
  }


}
