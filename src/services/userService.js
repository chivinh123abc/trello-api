import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'

const createNew = async (reqBody) => {
  try {
    // Kiem  tra  email  da ton tai trong he  thong  hay  chua
    const existUser = await userModel.findOneByEmail(reqBody.email)
    if (existUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email already exist!')
    }
    // Tao data de luu vao Data base
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8),
      //8 = do phuc tap (cang cao thi cang lau)
      username: nameFromEmail,
      displayName: nameFromEmail,

      verifyToken: uuidv4()
    }
    const createdUser = await userModel.createNew(newUser)
    const getNewUser = await userModel.findOneById(createdUser.insertedId)
    // Gui email  cho  ng dung  xac thuc tai khoan
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${getNewUser.email}&token=${getNewUser.verifyToken}`
    const customSubject = 'Please verify your email before using service!!'
    const htmlContent = `
      <h3>Here is your verification link:</h3>
      <h3>${verificationLink}</h3>
      <h3>Xinxin is dabet - RyanLuong</h3>
    `
    // Goi toi Provider gui mail
    await BrevoProvider.sendEmail(getNewUser.email, customSubject, htmlContent)

    // return du lieu
    return pickUser(getNewUser)
  } catch (error) {
    console.error('Send email error:', error.response?.body || error.message || error);
    throw error
  }
}

export const userService = {
  createNew
}
