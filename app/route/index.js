const jd = require('../service/JD')

module.exports = function(app, db) {

  app.use('/jd*', (req, res, next) => {
    if (jd.state.isPending()) {
      res.send({error: 'pending'})
    } else {
      next()
    }
  });

  app.get('/jd', (req, res) => {
    res.send(jd.getAllProduct())
  })

  app.post('/jd/add', (req, res) => {
    const pid = req.body.pid
    jd.addProductId(pid).then(productMap => {
      res.send(productMap)
    }).catch(err => {
      res.send(err)
    })
  })

  app.post('/jd/delete', (req, res) => {
    const pid = req.body.pid + ''
    jd.deleteProduct(pid).then(productMap => {
      res.send(productMap)
    }).catch(err => {
      res.send(err)
    })
  })

  app.get('/jd/:pid', (req, res) => {
    const pid = req.params.id
    res.send(jd.getProduct(pid))
  })
}
