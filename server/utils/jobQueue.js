const queue = [];

let running = 0; // number of currently running jobs
const MAX_CONCURRENCY = 3; // maximum number of concurrent jobs
const MAX_RETRIES = 3;
const MAX_QUEUE_SIZE = 100; // prevents the queue from growing indefinitely


async function processQueue() {
  // if the queue is empty or already running at max concurrency, exit
  while (queue.length && running < MAX_CONCURRENCY) {
    const { job, retries } = queue.shift();
    running++;
    job()
      .catch((err) => {
        if (retries < MAX_RETRIES) {
          queue.push({ job, retries: retries + 1 });
        } else {
          console.error("Job failed after retries:", err);
        }
      })
      .finally(() => {
        running--;
        processQueue(); // recursively process the next job
      });
  }
}

const addJob = (jobFn) => {
  if (queue.length >= MAX_QUEUE_SIZE) {
    console.warn("Queue overflow");
    return;
  }
  queue.push({ job: jobFn, retries: 0 });
  processQueue();
};

module.exports = { addJob };
