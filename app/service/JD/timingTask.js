const {TASK_INTERVAL} = require('./constant')

const MAX_TRY_TIME = 3 // 出错时的最大尝试次数
const TIME_OFF = -3600000 // 北京(东8)时区时差值
const DAY_TIME = 1000 * 60 * 60 * 24

const getNextTimeFrom = (time) => {
  return time + TASK_INTERVAL - ((time + TIME_OFF) % TASK_INTERVAL)
}
const getNextSupplyTimeFrom = (time) => {
  const timeAfterZero = 1000 * 60 * 10 // 超过10分钟，下面计算结果是每天的0点10分
  return time - (time % DAY_TIME) + 57600000 + DAY_TIME + timeAfterZero
}

let timingTask;

const start = (taskRun) => {
  let nextTime = 0;
  let nextSupplyTime = getNextSupplyTimeFrom(Date.now())
  let runningFlag = false

  const dealTask = async () => {
    runningFlag = true
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
    const now = Date.now()
    if (now > nextTime) {
      nextTime = getNextTimeFrom(now)
      dealTask().then()
    }
    /* 每天0点10分补充查询 */
    if (now > nextSupplyTime) {
      nextSupplyTime = getNextSupplyTimeFrom(now)
      if (!runningFlag) {
        dealTask().then()
      }
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