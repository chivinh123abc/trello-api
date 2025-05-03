// board
import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import { pagingSkipValue } from '~/utils/algorithms'

// Define Collection (name & schema)
const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),

  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),

  // Lưu ý các item trong mảng columnOrderIds là ObjectId nên cần thêm pattern cho chuẩn nhé, (lúc quay video số 57 mình quên nhưng sang đầu video số 58 sẽ có nhắc lại về cái này.)
  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  //board owners
  ownerIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),
  //board members
  memberOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

//Nhung truong ma tra khong muon cap nhat trong ham update
const INVALID_UPDATE_FIELDS = ['_id', 'createdAt']

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    // console.log(validData)
    const createdBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(validData)
    // console.log(createdBoard)
    return createdBoard
    // return await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(data)
  } catch (error) {
    throw new Error(error)
  }
}

const findOneById = async (boardId) => {
  try {
    // console.log(id)
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({
      // _id: new ObjectId(id) => fix loi deprecated
      _id: new ObjectId(String(boardId))
    })
    // console.log(result)
    return result
  } catch (error) {
    throw new Error(error)
  }
}

//Query thong hop (aggregate) de lay toan bo Columns va Cards thuoc ve Board
const getDetails = async (boardId) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      {
        $match: {
          _id: new ObjectId(String(boardId)),
          _destroy: false
        }
      },
      {
        $lookup: {
          from: columnModel.COLUMN_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'columns'
        }
      },
      {
        $lookup: {
          from: cardModel.CARD_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'boardId',
          as: 'cards'
        }
      }
    ]).toArray()

    return result[0] || null

  } catch (error) {
    throw new Error(error)
  }
}

//Nhiem vu cua function nay la push 1 gia tri column Ids vao cuoi mang ColumnOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    const res = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(column.boardId)) },
      { $push: { columnOrderIds: new ObjectId(String(column._id)) } },
      { returnDocument: 'after' }
    )
    return res
  } catch (error) {
    throw new Error(error)
  }
}
// Lay 1 phan tu columnId  ra khoi mang columnOrderIds
// Dung $pull trong mongodb de lay 1 phan tu ra khoi mang r xoa no di
const pullColumnOrderIds = async (column) => {
  try {
    const res = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(column.boardId)) },
      { $pull: { columnOrderIds: new ObjectId(String(column._id)) } },
      { returnDocument: 'after' }
    )
    return res
  } catch (error) {
    throw new Error(error)
  }
}

const update = async (boardId, updateData) => {
  try {
    //loc cac field khong cho phep cap nhat linh tink
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })
    // Doi voi nhung du lieu lien quan ObjectId, bien doi o day
    if (updateData.columnOrderIds) {
      updateData.columnOrderIds = updateData.columnOrderIds.map(_id => (new ObjectId(String(_id))))
    }

    const res = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(String(boardId)) },
      { $set: updateData },
      { returnDocument: 'after' }
    )
    return res
  } catch (error) {
    throw new Error(error)
  }
}

const getBoards = async (userId, page, itemsPerPage) => {
  try {
    const queryConditions = [
      // Dieu kien 01: Board chua bi xoa
      { _destroy: false },
      // Dieu kien 02: userId dang thuc hien request nay phai thuoc 1 trong 2 mang ownerIds or memberIds, su dung toan tu $all cua mongodb
      {
        $or: [
          { ownerIds: { $all: [new ObjectId(String(userId))] } },
          { memberIds: { $all: [new ObjectId(String(userId))] } }
        ]
      }
    ]

    const query = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate(
      [
        { $match: { $and: queryConditions } },
        // sort title board theo A-Z(mac dinh se bi chu B hoa dung truoc chu a thuong (Theo chuan ma ASCII))
        { $sort: { title: 1 } },
        // $facet de xu ly nhieu luong trong query
        {
          $facet: {
            // Luong thu 01: Query boards
            'queryBoards': [
              // Bo qua so luong ban ghi cua nhung page truoc do
              { $skip: pagingSkipValue(page, itemsPerPage) },
              // Gioi han toi da so luong ban ghi tra ve tren 1 page
              { $limit: itemsPerPage }
            ],

            // Luong thu 02: Query den tong so luong ban ghi boards trong DB va tra ve vao bien: countedAllBoards
            'queryTotalBoards': [{ $count: 'countedAllBoards' }]
          }
        }
      ],
      // Khai bao them thuoc tinh collation locale 'en' de fix vu B hoa va a thuong
      // Dung de sua cach sap xep cua mongoDB
      { collation: { locale: 'en' } }
    ).toArray()

    const res = query[0]

    return {
      boards: res.queryBoards || [],
      totalBoards: res.queryTotalBoards[0]?.countedAllBoards || 0
    }

  } catch (error) {
    throw new Error(error)
  }
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  update,
  pullColumnOrderIds,
  getBoards
}