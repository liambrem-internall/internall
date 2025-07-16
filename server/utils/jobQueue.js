const queue = [];
let running = false;

async function processQueue() {
  if (running) return;
  running = true;
  while (queue.length) {
    const job = queue.shift();
    await job();
  }
  running = false;
}

const addJob = (jobFn) => {
  queue.push(jobFn);
  processQueue();
}

module.exports = { addJob };