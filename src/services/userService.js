import { StatusCodes } from 'http-status-codes'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'

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
    // console.error('Send email error:', error.response?.body || error.message || error);
    throw error
  }
}

const verifyAccount = async (reqBody) => {
  try {
    // Query user trong data base
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // Cac buoc kiem tra can thiet
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')

    if (existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account has been actived')
    if (reqBody.token !== existUser.verifyToken) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Invalid Token')

    // Neu moi thu ok thi bat dau update lai thong tin cua user de verify tk
    const updatedData = {
      isActive: true,
      verifyToken: null
    }
    // Thuc hien update thong tin user
    const updatedUser = await userModel.update(existUser._id, updatedData)

    return pickUser(updatedUser)

  } catch (error) {
    throw (error)
  }
}

const login = async (reqBody) => {
  try {
    // Query user trong data base
    const existUser = await userModel.findOneByEmail(reqBody.email)

    // Cac buoc kiem tra can thiet
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account not actived')
    if (!bcryptjs.compareSync(reqBody.password, existUser.password)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your email or password is incorrect!!!')
    }
    /**  Nếu mọi thứ Ok thì bắt đầu tạo Tokens đăng nhập để trả về cho phía FE */
    // Tao thông tin sẽ đính kèm trong JWT Token bao gồm _id và email của user
    const userInfo = {
      _id: existUser._id,
      email: existUser._email
    }
    // Tạo ra 2 loại token, accessToken và refreshToken để trả về cho phía FE
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5 // 5 seconds
      env.ACCESS_TOKEN_LIFE
    )

    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      // 15 // 15sec
      env.REFRESH_TOKEN_LIFE
    )
    // Trả về thông tin của user kèm 2 token vừa mới tạo
    return { accessToken, refreshToken, ...pickUser(existUser) }
  } catch (error) {
    throw (error)
  }
}

const refreshToken = async (clientRefreshToken) => {
  // verify / giải mã refreshToken có hợp lệ không
  try {
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      clientRefreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    )
    // Chỉ lưu những thông tin unique và định của user trong token, vì vậy có thể lấy luôn từ decoded ra, tiết kiệm query vào DB để lấy data mới.
    const userInfo = {
      _id: refreshTokenDecoded._id,
      email: refreshTokenDecoded.email
    }

    // Tạo accessToken mới
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5 // testAccessHetHan
      env.ACCESS_TOKEN_LIFE // 1 hours
    )
    return { accessToken }
  } catch (error) {
    throw error
  }
}

const update = async (userId, reqBody) => {
  try {
    // Query user va kiem tra cho chac chan
    const existUser = await userModel.findOneById(userId)
    if (!existUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account not found')
    if (!existUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account is not active!')

    // khởi tạo kết quả updatedUser ban đầu là empty
    let updatedUser = {}
    // Change Password Case
    if (reqBody.current_password && reqBody.new_password) {
      // Check currentPassword dung hay  khong
      if (!bcryptjs.compareSync(reqBody.current_password, existUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Your password is incorrect!!!')
      }
      // If current_password is correct, we will hash new password and update to DB
      updatedUser = await userModel.update(existUser._id, {
        password: bcryptjs.hashSync(reqBody.new_password, 8)
      })
    } else {
      // Update General Infomation, Ex: DisplayName
      updatedUser = await userModel.update(existUser._id, reqBody)
    }
    return pickUser(updatedUser)

  } catch (error) {
    throw (error)
  }
}


export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update
}
