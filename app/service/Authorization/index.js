
const DB = require('../../dataBase')

const DB_NAME = 'authorization'
const USERS_COL = 'users'
const USERS_CONFIG_COL = 'user_config'

exports.getAuthList = async () => {
  return DB.getData({active: true}, USERS_COL, DB_NAME)
}

exports.getUserConfig = async () => {
  return DB.getData({}, USERS_CONFIG_COL, DB_NAME)
}
