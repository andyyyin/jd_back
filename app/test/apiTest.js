const axios = require('axios')

const API_ROOT = 'http://localhost:3389/'

const get = (url) => {
  return axios.get(API_ROOT + url)
}
const post = (url, params) => {
  return axios.post(API_ROOT + url, params)
}

post('jd/delete', {pid: 100003312839}).then(data => {
  console.log(data.data)
})
