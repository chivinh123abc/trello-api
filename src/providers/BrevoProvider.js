// Provider
const SibApiV3Sdk = require('@getbrevo/brevo')
import { env } from '~/config/environment'

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (recipientEmail, customSubject, customHtmlContent) => {
  //  Khoi tao senSmtpEmail voi nhung thong tin can thiet
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()
  // Tai khoan gui mail - dia chi admin email chu khong phai la email ma dung de tao tk
  sendSmtpEmail.sender = {
    email: env.ADMIN_EMAIL_ADDRESS,
    name: env.ADMIN_EMAIL_NAME
  }
  // Nhung tai khoan nhan mail
  // 'to' la  1 Array de co the tuy bien gui 1 email den nhieu user
  sendSmtpEmail.to = [{ email: recipientEmail }]
  // Tieu de email
  sendSmtpEmail.subject = customSubject
  // Noi dung email dang html
  sendSmtpEmail.htmlContent = customHtmlContent
  // Goi hanh  dong  gui mail
  // sendTransacEmail tra ve 1 Promise
  return apiInstance.sendTransacEmail(sendSmtpEmail)
}

export const BrevoProvider = {
  sendEmail
}