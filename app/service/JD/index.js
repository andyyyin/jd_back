const api = require('./api');
const analysis = require("./analysis")
const store = require("./storage")
const timingTask = require('./timingTask')
const state = require('./state')
const notification = require('./notification')

let _productMap = {};
let _userMap = {};

const loadProductIds = async () => {
  let products = await store.loadProductList() || []
  let idMap = {};
  let userMap = {};
  products.forEach(({pid, user, sub}) => {
    idMap[pid] = true
    if (userMap[user]) {
      userMap[user].push({pid, sub})
    } else {
      userMap[user] = [{pid, sub}]
    }
  })
  _userMap = userMap
  return Object.keys(idMap)
}

const getProductListByUser = (user) => {
  const idList = _userMap[user]
  const result = []
  if (!idList) return result
  idList.forEach(({pid, sub}) => {
    let product = _productMap[pid]
    if (!product) return
    // 这里 sub（订阅价）值会直接修改到productMap里面不是很好，有机会想办法优化这里
    // sub 不管有没有值都要覆盖原有值，防止不同用户数据相互影响
    product.sub = sub
    result.push(product)
  })
  return result
}

const getPromotion = promotionData => {
  if (!promotionData || !promotionData.prom || !promotionData.prom.pickOneTag) return null
  const promoList = promotionData.prom.pickOneTag
  if (!promoList.map && !promoList.length) return null
  return promoList.map(({content}) => ({content}))
}

const saveRecords = async () => {
  const time = Date.now()
  const list = Object.values(_productMap).map(product => {
    let pid = product.id
    let price = product.p_price || product.price
    let prom = product.promRank && product.promRank[0] && product.promRank[0].ratePrice
    if (!prom || prom === price) prom = null
    return {pid, price, prom, time}
  })
  return store.checkAndPushNewRecords(list)
}

const loadProducts = async (newId) => {
  state.startPending()

  const ids = newId ?
    [newId] :
    await loadProductIds()

  let newProductMap = {}

  const product = await api.getProduct2(ids.join(','));
  const priceList = await api.getPrice(ids.join(','))

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];

    const name = product[id].name;
    const imgUrl = `https://img10.360buyimg.com/evalpic/s240x240_${product[id].imagePath}`
    const color = product[id].color;

    const info = await api.getExtraInfo(id)
    // console.log(info)
    const cid = info.rank3
    const shop = info.seller
    const shopId = info.shopId

    const priceInfo = priceList.find(p => p.id === 'J_' + id)
    const originPrice = priceInfo.op
    const price = priceInfo.tpp || priceInfo.p
    const isDown = Number(price) < 0
    // todo priceInfo.m 是什么

    const {coupons} = await api.getTicket(id, cid)
    const tickets = []
    coupons.forEach(c => {
      const {quota, discount} = c
      let text = ' - 未知 - '
      if (!isNaN(quota) && !isNaN(discount)) {
        text = `满${c.quota}减${c.discount}`
      }
      if (!tickets.find(t => t.quota === quota && t.discount === discount)) {
        tickets.push({quota, discount, text})
      }
    })

    const promotionData = await api.getPromotion(id, cid)
    const promotions = getPromotion(promotionData)

    newProductMap[id] = {id, name, imgUrl, color, cid, shop, shopId, price, originPrice,
      tickets, promotions, isDown}
  }

  // 在全量查询的情况直接更新 productMap 是为了能够定期清理已经被所有用户删除的商品
  if (newId) {
    Object.assign(_productMap, newProductMap)
  } else {
    _productMap = newProductMap
  }

  analysis(_productMap)
  await saveRecords(_productMap)
  state.endPending()
  notification.deal(_productMap, _userMap)

  return _productMap
}


/* --------------------------- public --------------------------- */

const jd = {}

jd.addProductId = async (pid, user) => {
  if (!_userMap[user]) _userMap[user] = []
  if (_userMap[user].find(u => u.pid === pid)) {
    return getProductListByUser(user)
  }
  await store.addProduct(pid, user)
  _userMap[user].push({pid})
  await loadProducts(pid)
  return getProductListByUser(user)
}

jd.deleteProduct = async (pid, user) => {
  await store.deleteProduct(pid, user)
  const list = _userMap[user];
  list.splice(list.findIndex(u => u.pid === pid), 1)
  // 这里不再手动清理 productMap 而是随定期更新自动清理
  return getProductListByUser(user)
}
jd.setSubscription = async (pid, user, sub) => {
  if (!_userMap[user]) return
  let item = _userMap[user].find(u => u.pid === pid)
  if (!item) return
  item.sub = sub
  await store.setSubscription(pid, user, sub)
  return getProductListByUser(user)
}

jd.getProduct = (id) => _productMap[id]

jd.getProductListByUser = getProductListByUser

jd.startTimingTask = () => {
  timingTask.start(loadProducts)
}
jd.getProductHistory = (pid, raw) => {
  return store.getProductHistory(pid, raw)
}
jd.state = state

module.exports = jd

