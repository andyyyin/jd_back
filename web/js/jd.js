
const waitTime = (time) => {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

const goBackHome = () => {
  window.location.pathname = '';
}

const jdRequest = async ({url, method, params}) => {
  const auth = localStorage.getItem('jd_auth')
  if (!auth) {
    goBackHome()
    return
  }
  const headers = {
    'Authorization': auth,
  }
  try {
    const response = await axios({
      url: '/jd' + url,
      headers,
      method,
      data: params
    })
    return response.data
  } catch (e) {

    if (e.response && e.response.data) {
      const res = e.response
      if (res.data === 'pending') {
        await waitTime(2000)
        console.log('retry') // todo
        return jdRequest({url, method, params})
      } else if (res.status === 401) {
        alert('无权限访问')
        goBackHome()
      } else {
        alert(e.message)
      }
    } else {
      alert(e.message)
    }

  }
}

const getJD = (url) => {
  // const {data} = await axios.get(API_ROOT + url)
  const method = 'get'
  return jdRequest({url, method})
}
const postJD = (url, params) => {
  // const {data} = await axios.post(API_ROOT + url, params)
  const method = 'post'
  return jdRequest({url, method, params})
}

const getProductList = async () => {
  return getJD('/')
}

const addProductId = (pid) => {
  return postJD('/add', {pid})
}

const deleteProduct = (pid) => {
  return postJD('/delete', {pid})
}

const checkId = (pid) => {
  return getJD(`/check-id/${pid}`)
}

const updateSubscribe = (pid, value) => {
  return postJD('/subscribe', {pid, value})
}

const loadHistory = (pid, raw) => {
  return getJD(`/${pid}/history${raw ? '?raw=1' : ''}`)
}
