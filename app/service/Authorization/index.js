
const DB = require('../../dataBase')

const DB_NAME = 'authorization'
const USERS_COL = 'users'

exports.getAuthList = async () => {
  return DB.getData({active: true}, USERS_COL, DB_NAME)
}