import { parentPort } from 'worker_threads'
import { imageGeneratorFunction, ytChart } from "./ytChartMaker";

const id = parentPort.workerData.id;
const optionsObject = parentPort.workerData.optionsObject;

ytChart(id, optionsObject).then((result: any) => {
    parentPort.postMessage(result);
});