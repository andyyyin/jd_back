const assert = require('assert')
const DB = require('../../dataBase')

const DB_NAME = 'chaos_jd'
const PRODUCT_LIST_COL = 'product_list'
const PRODUCT_DATA_COL = 'product_data'
const TIMING_TASK_COL = 'task_record'

const newConfig = (pid) => {
  return {
    pid,
    active: true,
    start: Date.now()
  }
}

const loadProductList = () => {
  return DB.getData({active: true}, PRODUCT_LIST_COL, DB_NAME)
}

const addProduct = async (pid) => {
  let query = {pid}
  let set = newConfig(pid)
  // todo 添加已存在并且激活中的商品，会覆盖start time
  return DB.upsertOne(query, set, PRODUCT_LIST_COL, DB_NAME)
}

const deleteProduct = async (pid) => {
  let query = {pid}
  let set = {active: false, end: Date.now()}
  return DB.updateOne(query, set, PRODUCT_LIST_COL, DB_NAME)
}

const checkAndPushNewRecords = async (records) => {
  if (!records || !records.length) return null
  const pushList = []
  // todo 将循环查询改为一次性查询（pid分组取最新数据）
  await Promise.all(records.map((r) => {
    return new Promise(resolve => {
      let query = {pid: r.pid + ''}
      DB.getLastOne(query, PRODUCT_DATA_COL, DB_NAME).then(last => {
        if (!last || last.price !== r.price || last.prom !== r.prom) {
          pushList.push(r)
        }
        resolve()
      })
    })
  }))
  return DB.insertData(pushList, PRODUCT_DATA_COL, DB_NAME)
}

const getLastTask = async () => {
  return DB.getLastOne({}, TIMING_TASK_COL, DB_NAME)
}

const pushTimingTask = async (record) => {
  return DB.insertData(record, TIMING_TASK_COL, DB_NAME)
}

const getProductHistory = async (pid) => {
  let rawData = await DB.getData({pid}, PRODUCT_DATA_COL, DB_NAME)
  const result = []

  rawData.forEach(({price, prom, time}, index) => {
    if (!prom) prom = price
    // const dateObj = new Date(parseInt(time))
    // const month = dateObj.getMonth() + 1
    // const day = dateObj.getDate()
    // const date = month + '.' + day
    const dayTime = new Date(new Date(parseInt(time)).setHours(0, 0, 0, 0)).getTime()

    const prev = result[result.length - 1]
    if (!prev || prev.dayTime !== dayTime) {
      result.push({price, prom, dayTime})
    } else {
      if (Number(price) < Number(prev.price)) prev.price = price
      if (Number(prom) < Number(prev.prom)) prev.prom = prom

      /* 如果一条数据是当天的最后一条，而它的值与当天最低值不相等，并且下一条数据不是第二天的
      * 那么就造一条第二天的数据，值等于当前数据，防止第二天的数据被当天的最低数据覆盖 */

      const nextData = rawData[index + 1]
      const targetDayTime = dayTime + (1000 * 60 * 60 * 24 * 2)
      const nextDayTime = dayTime + (1000 * 60 * 60 * 24)

      const isToday = Date.now() < nextDayTime
      const hasDataBeforeTarget = nextData && parseInt(nextData.time) < targetDayTime

      if (!isToday && !hasDataBeforeTarget && (prev.price !== price || prev.prom !== prom)) {
        result.push({price, prom, dayTime: nextDayTime})
      }
    }
  })
  return result
}


module.exports = {
  loadProductList,
  addProduct,
  deleteProduct,
  checkAndPushNewRecords,
  getLastTask,
  pushTimingTask,
  getProductHistory,
}