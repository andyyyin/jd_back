const express = require('express')
const app = express();
const bodyParser = require('body-parser')

const PORT = 3389

app.use((req, res, next) => {
  // 设置是否运行客户端设置 withCredentials
  // 第二个参数表示允许跨域的域名，* 代表所有域名
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', '*') // 允许的 http 请求的方法
  // 允许前台获得的除 Cache-Control、Content-Language、Content-Type、Expires、Last-Modified、Pragma 这几张基本响应头之外的响应头
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})
app.use(express.static('./'))
// 下面是让api可以在application/json格式请求参数下读取数据
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.engine('html', require('ejs').renderFile)
// app.set('view engine', 'html');

app.get('/', (req, res) => {
  res.sendFile('/index.html')
})

app.get('/see', (req, res) => {
  res.send('you see me')
})

/* ----------------------------------------------- */



/* ----------------------------------------------- */

app.listen(PORT, () => {
  console.log(`rising chaos listening on port ${PORT}`)
})