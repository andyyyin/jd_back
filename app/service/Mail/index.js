const nodemailer = require('nodemailer');
const {MAIL_AUTH} = require('../../../info')

const send = ({title, content, address}) => {
  return new Promise(resolve => {
    try {
      let transporter = nodemailer.createTransport({
        host: MAIL_AUTH.host,
        port: MAIL_AUTH.port,
        secureConnection: false,
        auth: MAIL_AUTH
      });

      let mailOptions = {
        from: 'Andy Notice JD',
        to: address,
        subject: title || '未设置标题的邮件',
        html: `<b>${content || ''}</b>`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          resolve(false)
        }
        console.log('Message sent: %s', info.messageId);
        resolve(true)
      });
    } catch (e) {
      console.log(e);
      resolve(false)
    }
  })
}

module.exports = {
  send
}
