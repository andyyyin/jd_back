const api = require('./api');
const analysis = require("./analysis")
const store = require("./storage")
const timingTask = require('./timingTask')
const state = require('./state')

const _productMap = {};

const loadProductIds = async () => {
  let products = await store.loadProductList() || []
  return products.map(p => p.pid)
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

const loadProducts = async (id) => {
  state.startPending()

  const ids = id ?
    [id] :
    await loadProductIds()

  const product = await api.getProduct2(ids.join(','));
  // console.log(product)
  const priceList = await api.getPrice(ids.join(','))
  // console.log(priceList)

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
      if (quota && discount) {
        text = `满${c.quota}减${c.discount}`
      }
      if (!tickets.find(t => t.quota === quota && t.discount === discount)) {
        tickets.push({quota, discount, text})
      }
    })

    const promotionData = await api.getPromotion(id, cid)
    const promotions = getPromotion(promotionData)

    _productMap[id] = {id, name, imgUrl, color, cid, shop, shopId, price, originPrice,
      tickets, promotions, isDown}
  }
  analysis(_productMap)
  await saveRecords(_productMap)

  state.endPending()
  return _productMap
}


/* --------------------------- public --------------------------- */

const jd = {}

jd.addProductId = async (id) => {
  await store.addProduct(id)
  await loadProducts(id)
  return _productMap
}

jd.deleteProduct = async (id) => {
  await store.deleteProduct(id)
  delete _productMap[id]
  return _productMap
}

jd.getProduct = (id) => _productMap[id]

jd.getAllProduct = () => _productMap

jd.startTimingTask = () => {
  timingTask.start(loadProducts)
}
jd.state = state

module.exports = jd

