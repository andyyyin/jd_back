const {TASK_INTERVAL} = require('./constant')

const TIME_ZONE_OFF = 3600000 // 北京(东8)时区时差值

const MAX_TRY_TIME = 3 // 出错时的最大尝试次数

const getNextTimeFrom = (time) => {
  return time + TASK_INTERVAL - ((time - TIME_ZONE_OFF) % TASK_INTERVAL)
}

let timingTask;

const start = (taskRun) => {
  let nextTime = 0
  let runningFlag = false

  const dealTask = async () => {
    runningFlag = true
    nextTime = getNextTimeFrom(Date.now())
    let tryTime = 0;
    while (tryTime++ <  MAX_TRY_TIME) {
      try {
        let start = Date.now()
        await taskRun()
        let end = Date.now()
        console.log(`${start} run ${Number((end - start) / 1000).toFixed(2)}s`)
        break;
      } catch (e) {
        console.error(e)
      }
    }
    runningFlag = false
  }

  timingTask = setInterval(() => {
    if (runningFlag) return
    if (Date.now() > nextTime) {
      dealTask().then()
    }
  }, 666)
}

const stop = () => {
  clearInterval(timingTask)
}

module.exports = {
  start,
  stop,
}