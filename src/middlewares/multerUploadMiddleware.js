import { StatusCodes } from 'http-status-codes'
import multer from 'multer'
import ApiError from '~/utils/ApiError'
import { ALLOW_COMMON_FILE_TYPES, LIMIT_COMMON_FILE_SIZE } from '~/utils/validators'

/** Hầu hết nội dung đều có ở docs của multer, chỉ là anh tổ chức lại sao cho khoa học và gọn gàng nhất có thể
* https://www.npmjs.com/package/multer
*/

// Function kiểm tra loại file nào được chấp nhận
const customFileFilter = (req, file, callback) => {
  // console.log('Multer file: ', file)

  // Doi vs multer, khi kiem tra file kieu file thi su dung mimetype
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'File type is invalid. Only accept jpg, jpeg and png'
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null)
  }
  // Neu kieu file hop le
  return callback(null, true)
}


// Khoi tao function upload duoc boc boi multer
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFileFilter
})

export const multerUploadMiddleWare = { upload }
