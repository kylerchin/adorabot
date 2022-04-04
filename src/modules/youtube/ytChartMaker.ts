const { Worker } = require('worker_threads')

import { cassandraclient } from "../cassandraclient";
import {logger, tracer} from "../logger"
import {dogstatsd} from '../dogstats'
const TimeUuid = require("cassandra-driver").types.TimeUuid;
const { createCanvas, registerFont, loadImage } = require("canvas");
registerFont(`${__dirname}/../../LexendDecaMedium.ttf`, {
  family: "Lexend Deca",
});
const editJsonFile = require("edit-json-file");
var importconfigfile = editJsonFile(`${__dirname}/../../removedytvids.json`);

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
  return new Promise(async (resolve, reject) => {
    const worker = new Worker('./workerYtChart.js', { id, optionsObject });
    worker.on('message', (message) => {
 
      resolve(message);
      dogstatsd.histogram('adorabot.ytchart.chartdrawtimehist', Date.now() - beginningTime);
    });
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    })
  });
}
