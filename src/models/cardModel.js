// card
import Joi from 'joi'
import {
  EMAIL_RULE,
  EMAIL_RULE_MESSAGE,
  OBJECT_ID_RULE,
  OBJECT_ID_RULE_MESSAGE
} from '~/utils/validators'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'

// Define Collection (name & schema)
const CARD_COLLECTION_NAME = 'cards'
const CARD_COLLECTION_SCHEMA = Joi.object({
  boardId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  columnId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),

  title: Joi.string().required().min(3).max(50).trim().strict(),
  description: Joi.string().optional(),
  memberIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  // Du lieu comments cua Card se duoc  hoc cach nhung - embedded vao ban ghi Card luon nhu duoi day
  comments: Joi.array().items({
    userId: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    userEmail: Joi.string().pattern(EMAIL_RULE).message(EMAIL_RULE_MESSAGE),
    userAvatar: Joi.string(),
    userDisplayName: Joi.string(),
    content: Joi.string(),
    // Cho nay luu y  vi dung ham $push de them comment nen k set defaut  Date.now giong insertOne khi create dc
    commentedAt: Joi.date().timestamp()
  }).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const INVALID_UPDATE_FIELDS = ['_id', 'createdAt', 'boardId']

const validateBeforeCreate = async (data) => {
  return await CARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)

    const createdCard = await GET_DB().collection(CARD_COLLECTION_NAME).insertOne({
      ...validData,
      boardId: new ObjectId(String(validData.boardId)),
      columnId: new ObjectId(String(validData.columnId))
    })

    return createdCard
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (cardId) => {
  try {
    // console.log(id)
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).findOne({
      // _id: new ObjectId(id) => fix loi deprecated
      _id: new ObjectId(String(cardId))
    })
    // console.log(result)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (cardId, updateData) => {
  try {
    //loc cac field khong cho phep cap nhat linh tink
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })
    //Doi voi du lieu lien quan den ObjectId, bien doi o day
    if (updateData.columnId) { updateData.columnId = new ObjectId(String(updateData.columnId)) }

    const res = await GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(cardId)) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return res
  } catch (error) {
    throw new Error(error)
  }
}

const deleteManyByColumnId = async (columnId) => {
  try {
    const result = await GET_DB().collection(CARD_COLLECTION_NAME).deleteMany({
      columnId: new ObjectId(String(columnId))
    })
    return result
  } catch (error) {
    throw new Error(error)
  }
}

const unshiftNewComment = async (cardId, commentData) => {
  try {
    const result = GET_DB().collection(CARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(cardId)) },
      { $push: { comments: { $each: [commentData], $position: 0 } } },
      { returnDocument: 'after' }
    )
    return result
  } catch (error) {
    throw new Error(error)
  }
}


export const cardModel = {
  CARD_COLLECTION_NAME,
  CARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  update,
  deleteManyByColumnId,
  unshiftNewComment
}
