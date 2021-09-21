import { cassandraclient } from "./cassandraclient";
import { tracer } from "./logger";
const TimeUuid = require("cassandra-driver").types.TimeUuid;
const { createCanvas, registerFont, loadImage } = require("canvas");
registerFont(`${__dirname}/../../LexendDecaMedium.ttf`, {
  family: "Lexend Deca",
});
const editJsonFile = require("edit-json-file");
var importconfigfile = editJsonFile(`${__dirname}/../../removedytvids.json`);

var arrayOfMonthsEnglishShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Decs"]

const phi = 1.618033988749895;

interface optionsInterface {
  channelId?: string;
  [key: string]: any;
  addOnPoints?: AddOnPointsEntity[] | null;
}

interface AddOnPointsEntity {
  views: number;
  time: number;
  comments?: number | null | undefined;
  likes?: number;
  dislikes?: number;
}
export async function ytChart(id, optionsObject: optionsInterface) {
  return new Promise(async (resolve, reject) => {
    tracer.trace("youtubeMakeChart", () => {
      const canvas = createCanvas(3840, 2160);
      const ctx = canvas.getContext("2d");
      const ctxLegendXLabel = canvas.getContext("2d");
      const x = canvas.width / 2;

      var legendDepth = 100;
      var legendDepthSub = 60;

      var paddingLeft = 200;
      var paddingRight = 100;
      var paddingTop = 100;
      var paddingBottom = 200;
      var canvasHeightRange = canvas.height - paddingTop - paddingBottom;
      var canvasWidthRange = canvas.width - paddingLeft - paddingRight;

      var pointSize = 9;

      function drawCoordinates(x, y) {
        //  var ctx = canvas.getContext("2d");

        ctx.fillStyle = "#41ffca";
        ctx.beginPath();
        ctx.arc(x, y, pointSize, 0, Math.PI * 2, true);
        ctx.fill();
      }

      function drawDotFromPercentage(xper, yper) {
        var xDrawPlace = Math.round(canvasWidthRange * xper + paddingLeft);
        var yDrawPlace = Math.round(
          canvasHeightRange - canvasHeightRange * yper + paddingTop
        );
        drawCoordinates(xDrawPlace, yDrawPlace);
      }

      // [{xper: 0.1, yper:0.1}]
      function drawLineFromPercentageArray(array) {
        console.log("drawLine underlying");

        const ctxline = canvas.getContext("2d");

        ctxline.lineWidth = 9;

        ctxline.strokeStyle = "#a1a1a1";

        var hasStartedPoint = false;

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
          if (optionsObject.addOnPoints) {
            optionsObject.addOnPoints.forEach((eachPoint) => {
              numberOfRows += 1;

              var addontime = eachPoint.time;
              leastAndGreatestCheck(addontime, "leastTime", "greatestTime");
              // console.log("views", row.views)
              var addonviews = eachPoint.views;
              leastAndGreatestCheck(addonviews, "leastViews", "greatestViews");

              arrayOfStats.push({
                unixtime: addontime,
                views: addonviews,
              });
            });
          }
          // Stream ended, there aren't any more rows
          var viewRange: number =
            leastAndGreatestObject["greatestViews"] -
            leastAndGreatestObject["leastViews"];
          var timeRange: number =
            leastAndGreatestObject["greatestTime"] -
            leastAndGreatestObject["leastTime"];

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
          if (numberOfRows === 0 || viewRange < 3 || isBlocked) {
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

            ctxLegendXLabel.fillStyle = "#a1a1a1";
            ctxLegendXLabel.font = "50px Lexend Deca";
            // ctx.rotate(0.1)
            ctxLegendXLabel.textAlign = "center";

            while (timeLegend < leastAndGreatestObject["greatestTime"]) {
              //console.log("draw legend")
              var percxlegend =
                (timeLegend - leastAndGreatestObject["leastTime"]) / timeRange;
              var pointx = canvasWidthRange * percxlegend + paddingLeft;
              ctxSubLegend.moveTo(pointx, pointytop);
              ctxSubLegend.lineTo(pointx, pointybottom);
              ctxSubLegend.stroke();

              ctxLegendXLabel.fillText(
                `${arrayOfMonthsEnglishShort[new Date(timeLegend).getUTCMonth()]} ${new Date(timeLegend).getUTCDate()}`,
                pointx,
                canvas.height - 40
              );

              timeLegend += 60 * 60 * 24 * 1000;
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
                //draw ticks every 2 hours
                modulusHourInterval = 2;
              }

              if (timeRange < 60 * 60 * 24 * 1000) {
                //if the time window is less than 24 hours, draw labels every hour
                modulusHourIntervalLabel = 1;
              } else {
                //draw labels every 2 hours
                modulusHourIntervalLabel = 2;
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
              ctxSubMinorLegend.strokeStyle = "#414141";

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
            ctxSubYLineLegend.strokeStyle = "#414141";

            const ctxLegendYLabel = canvas.getContext("2d");
            ctxLegendYLabel.fillStyle = "#a1a1a1";
            ctxLegendYLabel.font = "50px Lexend Deca";
            ctxLegendYLabel.textBaseline = "middle";
            // ctx.rotate(0.1)
            ctxLegendYLabel.textAlign = "center";
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
                // console.log('yaxisdraw', yAxisDrawMillions)
                var percylegend =
                  (yAxisDrawMillions - leastAndGreatestObject["leastViews"]) /
                  viewRange;
                var pointy =
                  canvasHeightRange -
                  canvasHeightRange * percylegend +
                  paddingBottom;
                ctxSubYLineLegend.moveTo(paddingLeft - 50, pointy);
                ctxSubYLineLegend.lineTo(canvas.width - paddingRight, pointy);
                ctxSubYLineLegend.stroke();

                ctxLegendYLabel.fillText(
                  `${yAxisDrawMillions / 1.0e6}M`,
                  paddingLeft - 120,
                  pointy
                );
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
                      paddingBottom;
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
                      paddingLeft - 120,
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
            drawLineFromPercentageArray(connectingline);

            arrayOfStats.forEach((stat) => {
              var percentageOffsetFromLeft =
                (stat.unixtime - leastAndGreatestObject["leastTime"]) /
                timeRange;
              var percentageOffsetFromBottomViews =
                (stat.views - leastAndGreatestObject["leastViews"]) / viewRange;
              drawDotFromPercentage(
                percentageOffsetFromLeft,
                percentageOffsetFromBottomViews
              );
            });

            //now draw legends
            const ctxlegend = canvas.getContext("2d");
            ctxlegend.strokeStyle = "#c1c1c1";

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
          }

          const bufferinfo = canvas.toBuffer("image/png", {
            compressionLevel: 7,
          });
          console.log(bufferinfo);
          resolve(bufferinfo);
        })
        .on("error", function (err) {
          // Something went wrong: err is a response error from Cassandra
          console.log(err);
          reject(err);
        });
    });
  });
}
