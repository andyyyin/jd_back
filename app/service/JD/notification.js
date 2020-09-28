
const MAIL = require('../Mail')
const AUTH = require('../Authorization')

let userConfigData = null
let userNoticeLast = {}

const getUserConfig = async (user) => {
  if (!userConfigData) userConfigData = await AUTH.getUserConfig()
  return userConfigData.find(c => c.user === user)
}

const createMailConfig = async (noticeList, user) => {
  const {mail: address} = await getUserConfig(user)
  let title = ''
  let content = ''

  noticeList.forEach((n, i) => {
    if (title.length > 10) return
    title += n.brand
    if (i < noticeList.length - 1) {
      title += '、'
    }
  })
  if (title.length > 10) {
    title = title.substring(0, 10) + '...'
  }
  title += `，${noticeList.length}件商品低于订阅价`

  content += `
    <div>
      ${noticeList.map(({name, sub, price, prom}) => {
        return `
          <p style="font-size: 12px;">${name}</p>
          <p>
            <span style="flex: 1; color: red">¥${sub}</span>
            (<span style="flex: 1; color: black">¥${price} -</span>
            <span style="flex: 1; color: green">¥${prom}</span>)
          </p>
        `     
      })}
    </div>
  `

  return {address, title, content}
}

const itemSort = (pa, pb) => {
  if (pa.price < pa.sub && pb.price > pb.sub) {
    return -1
  } else if (pa.price > pa.sub && pb.price < pb.sub) {
    return 1
  } else if (pa.price < pa.sub && pb.price < pb.sub) {
    return (pa.price / pa.sub) - (pb.price / pb.sub)
  } else {
    return (pa.prom / pa.sub) - (pb.prom / pb.sub)
  }
}

const checkNoticeNewData = (list, user) => {
  const last = userNoticeLast[user]
  if (!last || !last.list || !last.list.length) {
    console.log('无last，直接发邮件')
    return true
  }
  if (new Date().toDateString() !== new Date(last.time).toDateString()) {
    console.log('不是同一天，直接发邮件')
    return true
  }
  let hasNew = false
  list.forEach(item => {
    if (hasNew) return
    let lastItem = last.list.find(l => l.id === item.id)
    if (!lastItem || lastItem.price !== item.price || lastItem.prom !== item.prom || lastItem.sub !== item.sub) {
      if (!lastItem) console.log(item.brand + ' 上次没有这个商品')
      if (lastItem.price !== item.price) console.log(item.brand + `price变化${lastItem.price} != ${item.price}`)
      if (lastItem.prom !== item.prom) console.log(item.brand + `prom变化${lastItem.prom} != ${item.prom}`)
      if (lastItem.sub !== item.sub) console.log(item.brand + `sub变化${lastItem.sub} != ${item.sub}`)
      hasNew = true
    }
  })
  return hasNew
}

const deal = (productMap, userMap) => {

  const users = Object.keys(userMap)
  users.forEach(user => {
    const noticeList = []

    userMap[user].forEach(({pid, sub}) => {
      sub = Number(sub)
      if (!sub) return
      let {id, price, p_price, promRank, name, brand} = productMap[pid]
      price = p_price ? Number(p_price) : Number(price)
      let prom = Number(promRank && promRank[0] && promRank[0].ratePrice) || price
      if (price > sub && prom > sub) return
      noticeList.push({id, name, brand, sub, price, prom})
    })

    if (noticeList.length && checkNoticeNewData(noticeList, user)) {
      noticeList.sort(itemSort)
      if (process.env.NODE_ENV === 'debug') {
        console.log('notice for user: ', user)
        console.log(noticeList)
      } else {
        createMailConfig(noticeList, user).then(MAIL.send)
      }
    }
    userNoticeLast[user] = {list: noticeList, time: Date.now()}

  })

}

module.exports = {
  deal
}