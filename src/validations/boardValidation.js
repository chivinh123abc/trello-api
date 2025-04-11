import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { BOARD_TYPES } from '~/utils/constants'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const createNew = async (req, res, next) => {
  /**
   * Note: Mặc định chúng ta không cần phải custom message ở BE
   * vì để cho FE tự validate và custom message phía  FE  cho đẹp
   * BE  chỉ  cần  validate ĐẢM BẢO DỮ LIỆU CHUẨN XÁC, và trả về  mesage mặc định từ thư viện
   * Quan trọng:  việc Validate dữ liệu BẮT BUỘC phải có ở BE vì  đây  là  điểm cuối để  lưu trữ  dữ  liệu vào Database
   * Và trong thực thế: tốt nhất cho  hệ  thống là hãy  luôn Validate data ở cả FE va BE
   */
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title is not allowed to be empty',
      'string.min': 'Title min 3 chars',
      'string.max': 'Title max 50 chars',
      'string.trim': 'Title must not having leading or trailling whitespace'
    }),
    description: Joi.string().required().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required()
  })
  try {
    //abortEarly: dung som chuong trinh khi bi loi de phat hien tat caloi validation
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    //Validate data xong va  hop  le thi se cho  request di  tiep sang Controller(Middlerware)
    next()
  } catch (error) {
    // const errorMessage = new Error(error).message
    // const customError = new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage)
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))

    // res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
    //   errors: new Error(error).message
    // })
  }

}

const update = async (req, res, next) => {
  const correctCondition = Joi.object({
    //Khong required khi update
    title: Joi.string().min(3).max(50).trim().strict(),
    description: Joi.string().min(3).max(256).trim().strict(),
    type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE),
    columnOrderIds: Joi.array().items(
      Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
    )
  })
  try {
    //abortEarly: dung som chuong trinh khi bi loi de phat hien tat caloi validation
    await correctCondition.validateAsync(req.body, {
      abortEarly: false,
      // allowUnknown : cho phep day them nhung field ngoai nhung field da dinh nghia trong correctCondition
      allowUnknown: true
    })
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }

}

export const boardValidation = {
  createNew,
  update
}
