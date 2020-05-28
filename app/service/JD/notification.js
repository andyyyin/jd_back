
const MAIL = require('../Mail')
const AUTH = require('../Authorization')

let userConfigData = null

const getUserConfig = async (user) => {
  if (!userConfigData) userConfigData = await AUTH.getUserConfig()
  return userConfigData.find(c => c.user === user)
}

const createMailConfig = async (noticeList, user) => {
  const {mail: address} = await getUserConfig(user)
  let title = ''
  let content = ''

  title += `${noticeList.length}件商品已低于订阅价`
  content += `
    <div>
      ${noticeList.map(({name, sub, price, prom}) => {
        return `
          <p>${name}</p>
          <p>订阅：¥${sub}，价格：¥${price}，优惠价：¥${prom}</p>
        `     
      })}
    </div>
  `

  return {address, title, content}
}

const deal = (productMap, userMap) => {

  const users = Object.keys(userMap)
  users.forEach(user => {
    const noticeList = []

    userMap[user].forEach(({pid, sub}) => {
      sub = Number(sub)
      if (!sub) return
      let {price, p_price, promRank, name} = productMap[pid]
      price = p_price ? Number(p_price) : Number(price)
      let prom = Number(promRank && promRank[0] && promRank[0].ratePrice)
      if (price > sub && prom > sub) return
      noticeList.push({name, sub, price, prom})
    })

    if (!noticeList.length) return

    createMailConfig(noticeList, user).then(MAIL.send)

  })

}

module.exports = {
  deal
}