const jd = require('../service/JD')
const auth = require('../service/Authorization')

module.exports = async (app, db) => {

  /* --- 获取权限列表 --- */
  const authList = await auth.getAuthList()

  const checkAuth = (req, res) => {
    const {authorization} = req.headers
    const auth = authList.find(a => a.deviceId === authorization)
    if (!auth) {
      res.status(401).send('No Access')
      return false
    }
    req.user = auth.user
    return true
  }

  /* --- user --- */

  app.use('/user*', (req, res, next) => {
    if(!checkAuth(req, res)) return
    next()
  });

  app.get('/user/config', (req, res) => {
    auth.getUserConfig(req.user).then(config => {
      res.send(config)
    }).catch(err => {
      res.send(err)
    })
  })

  app.post('/user/set-config', (req, res) => {
    auth.setUserConfig(req.user, req.body).then(config => {
      res.send(config)
    }).catch(err => {
      res.send(err)
    })
  })

  /* --- jd --- */

  app.use('/jd*', (req, res, next) => {
    if(!checkAuth(req, res)) return
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

  app.post('/jd/subscribe', (req, res) => {
    const pid = req.body.pid + ''
    const value = req.body.value + ''
    jd.setSubscription(pid, req.user, value).then(productList => {
      res.send(productList)
    }).catch(err => {
      res.send(err)
    })
  })

  app.get('/jd/:pid', (req, res) => {
    const pid = req.params.pid
    res.send(jd.getProduct(pid))
  })

  app.get('/jd/check-id/:pid', (req, res) => {
    const pid = req.params.pid
    jd.checkId(pid).then(result => {
      res.send(result)
    }).catch(err => {
      res.send(err)
    })
  })

  app.get('/jd/:pid/history', (req, res) => {
    const pid = req.params.pid + ''
    const raw = !!req.query.raw
    jd.getProductHistory(pid, raw).then(result => {
      res.send(result)
    }).catch(err => {
      res.send(err)
    })
  })
}
