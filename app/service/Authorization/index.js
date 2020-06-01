
const DB = require('../../dataBase')

const DB_NAME = 'authorization'
const USERS_COL = 'users'
const USERS_CONFIG_COL = 'user_config'

exports.getAuthList = async () => {
  return DB.getData({active: true}, USERS_COL, DB_NAME)
}

exports.getUserConfig = async (user) => {
  if (user) {
    let query = {user}
    return DB.getOne(query, USERS_CONFIG_COL, DB_NAME)
  } else {
    return DB.getData({}, USERS_CONFIG_COL, DB_NAME)
  }
}

exports.setUserConfig = async (user, {mail}) => {
  let query = {user}
  let set = {user, mail}
  await DB.upsertOne(query, set, USERS_CONFIG_COL, DB_NAME)
  return DB.getOne(query, USERS_CONFIG_COL, DB_NAME)
}