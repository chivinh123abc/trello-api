// JSON WEB TOKEN
import JWT from 'jsonwebtoken'

/**
 * Function tạo mới một token - Cần 3 tham số đầu vào
 * userInfo: Những thông tin muốn đính kèm vào token
 * secretSignature: Chữ ký bí mật (dạng string ngẫu nhiên) - trên docs thì để tên và privateKey tùy đều được
 * tokenLife: Thời gian sống của token
 */
const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    // Hàm sign() của library Jwt - Thuật toán mặc định là HS256
    return JWT.sign(userInfo,
      secretSignature,
      {
        algorithm: 'HS256',
        expiresIn: tokenLife
      })
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Function kiểm tra token có hợp lệ hay k
 * Hợp lệ ở đây hiểu đơn giản là token được tạo ra có đúng với chữ kí bí mật secretSignature trong dự án hay k
 */
const verifyToken = async (token, secretSignature) => {
  try {
    // Hàm verify của library Jwt
    return JWT.verify(token, secretSignature)
  } catch (error) {
    throw new Error(error)
  }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}