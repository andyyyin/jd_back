const axios = require('axios')
const {JD_AREA} = require('./constant')
const iconv = require('iconv-lite');

const api = {};

// api.getProduct = async id => {
//   const cat = encodeURIComponent('6196,6214,14222');
//   const url = `
//     https://c.3.cn/recommend
//     ?methods=accessories
//     &sku=${id}
//     &cat=${cat}
//   `.replace(/\s+/g, "");
//   console.log(url)
//   const result = await axios.get(url);
//   console.log(result)
//   if (result && result.data) {
//     return result.data
//   } else {
//     return null;
//   }
// };

api.getProduct2 = async id => {
  const url = `
    https://yx.3.cn/service/info.action
    ?ids=${id}
  `.replace(/\s+/g, "");
  const result = await axios({
    method: 'get',
    url,
    responseType: 'arraybuffer',
    headers: {
      'Accept': '*/*'
    }
  });
  return JSON.parse(iconv.decode(result.data, 'gbk'))
}

api.getExtraInfo = async id => {
  const url = `
    https://chat1.jd.com/api/checkChat
    ?callback=checkChatStatuCbA
    &pid=${id}
  `.replace(/\s+/g, "");
  const result = await axios({
    method: 'get',
    url,
    headers: {
      'referer': `https://item.m.jd.com/product/${id}.html`,
    }
  })
  const {data} = result
  if (!data || typeof data !== 'string') return data
  return JSON.parse(data.substring(0, data.length - 2).substring(18));
}

api.getPrice = async ids => {
  let idParam;
  if (typeof ids === 'object' && ids.join) {
    idParam = ids.join(',')
  } else {
    idParam = ids;
  }
  const url = `
    https://pe.3.cn/prices/mgets
    ?source=wxsq
    &skuids=${idParam}
  `.replace(/\s+/g, "");
  const result = await axios.get(url);
  return result.data
}

api.getTicket = async (id, cid, price) => {
  const url = `
    https://wq.jd.com/bases/couponsoa/avlCoupon
    ?cid=${cid}
    &popId=8888
    &sku=${id}
    ${price ? '&price=' + price : ''}
    &platform=4
  `.replace(/\s+/g, "");
  const result = await axios({
    url,
    method: 'get',
    headers: {
      'referer': `https://item.m.jd.com/product/${id}.html`,
      'cookie': 'pin=jd_7176c6272104f'
    }
  });
  return result.data
}

api.getPromotion = async (id, cid) => {
  const cat = encodeURIComponent('8888,8888,' + cid);
  const url = `
    https://cd.jd.com/promotion/v2
    ?skuId=${id}
    &area=${JD_AREA}
    &cat=${cat}
  `.replace(/\s+/g, "");

  const result = await axios({
    url,
    method: 'get',
    headers: {
      'user-agent': 'Mozilla/5.0',
    }
  });
  return result.data
}


module.exports = api;
