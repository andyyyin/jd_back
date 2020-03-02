
const DB = require('../dataBase')

const dbName = 'chaos_test';
const collection = 'inserts'

DB.connect().then(() => {
  // DB.insertData({a: 7, d: 11}, collection, dbName).then(() => {
  //   console.log('done')
  // })
  DB.getLastOne({a: 5}, collection, dbName).then((result) => {
    console.log(result)
  })
})

