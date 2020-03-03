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
  // if (method === 'post') {
  //   headers['content-type'] = 'application/x-www-form-urlencoded'
  // }
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
      alert(e.message) // todo
    } else {
      alert(e.message)
    }
  }
}


jdRequest({
  url: 'jd/delete',
  method: 'post',
  params: {
    pid: 100003312839
  }
}).then()




// const run = async () => {
//   try{
//     const data = await get('jd/')
//     console.log(data)
//   } catch (e) {
//     console.log(e)
//   }
// }
// run().then()

// post('jd/add', {pid: 100003312839}).then(data => {
//   console.log(data.data)
// })
