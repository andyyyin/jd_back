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
  let result = await DB.getData({pid}, PRODUCT_DATA_COL, DB_NAME)
  return result && result.map(({pid, price, prom, time}) => ({pid, price, prom, time}))
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