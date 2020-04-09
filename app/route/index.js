const jd = require('../service/JD')

module.exports = function(app, db) {

  app.use('/jd*', (req, res, next) => {
    if (jd.state.isPending()) {
      res.status(500).send('pending')
    } else {
      next()
    }
  });

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
