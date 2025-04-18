import { StatusCodes } from 'http-status-codes'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'
import ApiError from '~/utils/ApiError'

// Middleware này sẽ đảm nhiệm việc quan trọng, Xác thực accessToken nhận được từ  phía FE có hợp lệ hay k
const isAuthorized = async (req, res, next) => {
  // Lấy accessToken nằm trong request cookies phía clients - withCredentials trong file authorizeAxios
  const clientAccessToken = req.cookies?.accessToken
  // Nếu clientAccessToken không tồn tại thì trả về lỗi
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token not found)'))
    return
  }

  try {
    // Bước 1: Thực hiện giải mã token xem nó có hợp lệ hay không
    const accessTokenDecoded = await JwtProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_SECRET_SIGNATURE
    )
    // console.log('🚀 ~ isAuthorized ~ accessTokenDecoded:', accessTokenDecoded)
    // Bước 2: Quan trọng: Nếu như token hợp lệ, thì cần phải lưu thông tin giải mã được vào req.jwtDecoded, để sử dụng cho các tầng xử lý phía sau
    req.jwtDecoded = accessTokenDecoded
    // Bước 3: Cho phép request đi tiếp
    next()
  } catch (error) {
    // console.log('🚀 ~ isAuthorized ~ error:', error)
    // Nếu accessToken bị hết hạn (expired) thì cần trả về một mã lỗi GONE - 410 cho FE biết để gọi api refreshToken
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token.'))
      return
    }
    // Nếu accessToken không hợp lệ do bất kì điều gì khác hết hạn thì trả về lỗi 401 cho FE gọi api sign_out
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

export const authMiddleware = {
  isAuthorized
}