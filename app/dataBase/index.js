const {MongoClient, Long} = require('mongodb');
const assert = require('assert')
const DB_URL = 'mongodb://localhost:27017';

const client = new MongoClient(DB_URL);

let db;

const connect = () => {
  return new Promise(resolve => {
    client.connect(function(err) {
      assert.equal(err, null)
      console.log("Connected successfully to server");
      resolve()
    });
  })
}

const dateFilter = (data) => {
  const toLongTargetKeys = ['time', 'start', 'end']
  const toStringTargetKeys = ['pid']
  const filter = (data) => {
    toLongTargetKeys.forEach(key => {
      if (data[key] && typeof data[key] === 'number') {
        data[key] = Long.fromNumber(data[key])
      }
    })
    toStringTargetKeys.forEach(key => {
      if (data[key] && typeof data[key] !== 'string') {
        data[key] = data[key] + ''
      }
    })
    return data
  }
  if (Array.isArray(data)) {
    return data.map(filter)
  } else {
    return filter(data)
  }
}

const getDB = (name) => {
  if (!db || (name && db.databaseName !== name)) {
    db = client.db(name)
  }
  return db
}

const getData = (query, colName, dbName) => {
  assert.equal(typeof colName, 'string');
  return new Promise(resolve => {
    const col = getDB(dbName).collection(colName)
    query = query || {}
    col.find(dateFilter(query)).toArray(function(err, result) {
      assert.equal(err, null);
      resolve(result)
    });
  })
}

const getLastOne = (query, colName, dbName) => {
  assert.equal(typeof colName, 'string');
  return new Promise(resolve => {
    const col = getDB(dbName).collection(colName)
    query = query || {}
    col.findOne(dateFilter(query), {sort: [['_id', -1]]}, (err, result) => {
      assert.equal(err, null);
      resolve(result)
    })
  })
}

const insertData = (data, colName, dbName) => {
  if (!data || !data.length) return Promise.resolve()
  assert.equal(typeof data, 'object');
  assert.equal(typeof colName, 'string');

  return new Promise(resolve => {
    const col = getDB(dbName).collection(colName)
    let array = Array.isArray(data) ? data : [data];
    col.insertMany(dateFilter(array), function(err, result) {
      assert.equal(err, null);
      assert.equal(array.length, result.result.n);
      assert.equal(array.length, result.ops.length);
      resolve(result)
    });
  })
}

const updateOne = (query, set, colName, dbName, options) => {
  assert.equal(typeof query, 'object');
  assert.equal(typeof set, 'object');
  assert.equal(typeof colName, 'string');

  return new Promise(resolve => {
    const col = getDB(dbName).collection(colName)
    col.updateOne(dateFilter(query), { $set: dateFilter(set) }, options, function(err, result) {
      assert.equal(err, null);
      assert.equal(1, result.result.n);
      resolve(result);
    });
  })
}
const upsertOne = (query, set, colName, dbName) => {
  return updateOne(query, set, colName, dbName, {upsert: true})
}


module.exports = {
  connect,
  getData,
  insertData,
  updateOne,
  upsertOne,
  getLastOne,
}