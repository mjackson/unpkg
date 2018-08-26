const addMinutes = require("date-fns/add_minutes");
const startOfMinute = require("date-fns/start_of_minute");

const ingestLogs = require("./ingestLogs");

const oneSecond = 1000;
const oneMinute = oneSecond * 60;

let currentWorkload, timer;

function work() {
  const now = Date.now();

  // The log for a request is typically available within thirty (30) minutes
  // of the request taking place under normal conditions. We deliver logs
  // ordered by the time that the logs were created, i.e. the timestamp of
  // the request when it was received by the edge. Given the order of
  // delivery, we recommend waiting a full thirty minutes to ingest a full
  // set of logs. This will help ensure that any congestion in the log
  // pipeline has passed and a full set of logs can be ingested.
  // https://support.cloudflare.com/hc/en-us/articles/216672448-Enterprise-Log-Share-REST-API
  const start = startOfMinute(now - oneMinute * 31);
  const end = addMinutes(start, 1);

  currentWorkload = ingestLogs(start, end);
}

function shutdown() {
  console.log("Shutting down...");

  clearInterval(timer);

  currentWorkload.then(() => {
    console.log("Goodbye!");
    process.exit();
  });
}

work();

process.on("SIGINT", shutdown).on("SIGTERM", shutdown);

timer = setInterval(work, oneMinute);
