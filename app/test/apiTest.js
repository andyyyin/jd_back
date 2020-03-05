const axios = require('axios')

const API_ROOT = 'http://localhost:3389/'

const get = (url) => {
  return axios.get(API_ROOT + url)
}
const post = (url, params) => {
  return axios.post(API_ROOT + url, params)
}

const jdRequest = async ({url, method, params}) => {
  const headers = {}
  try {
    const response = await axios({
      url: API_ROOT + url,
      headers,
      method,
      data: params
    })
    return response.data
  } catch (e) {
    if (e.response && e.response.data && e.response.data === 'pending') {
      console.error(e.message) // todo
    } else {
      console.error(e.message)
    }
  }
}


jdRequest({
  url: 'jd/100003312839/history',
  method: 'get',
}).then(result => {
  console.log(result)
})

