const jd = require('../service/JD')
const auth = require('../service/Authorization')

module.exports = async (app, db) => {

  /* --- 获取权限列表 --- */
  const authList = await auth.getAuthList()

  app.use('/jd*', (req, res, next) => {
    const {authorization} = req.headers
    const auth = authList.find(a => a.deviceId === authorization)
    if (!auth) {
      res.status(401).send('No Access')
      return
    }
    req.user = auth.user
    if (jd.state.isPending()) {
      res.status(500).send('pending')
      return
    }
    next()
  });

  app.get('/jd/auth', (req, res) => {
    res.send('ok')
  })

  app.get('/jd', (req, res) => {
    res.send(jd.getProductListByUser(req.user))
  })

  app.post('/jd/add', (req, res) => {
    const pid = req.body.pid + ''
    jd.addProductId(pid, req.user).then(productList => {
      res.send(productList)
    }).catch(err => {
      res.send(err)
    })
  })

  app.post('/jd/delete', (req, res) => {
    const pid = req.body.pid + ''
    jd.deleteProduct(pid, req.user).then(productList => {
      res.send(productList)
    }).catch(err => {
      res.send(err)
    })
  })

  app.get('/jd/:pid', (req, res) => {
    const pid = req.params.pid
    res.send(jd.getProduct(pid))
  })

  app.get('/jd/:pid/history', (req, res) => {
    const pid = req.params.pid + ''
    jd.getProductHistory(pid).then(result => {
      res.send(result)
    }).catch(err => {
      res.send(err)
    })
  })
}
