//
import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'

const createNew = async (reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    //  Xử lý logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }
    // gọi tới tầng model để xử lý bản ghi newBoard vào trong Database
    const createdBoard = await boardModel.createNew(newBoard)

    //Lay ban ghi  board sau khi goi (tuy muc dich du an ma co  can  buoc nay hay k)
    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
    // console.log(getNewBoard)

    //Làm thêm các xử lý logic khác với các collection khác tùy đặc thù dự án
    //Bắn email, notification về cho admin khi có 1 board mới được tạo

    //Trong service luôn phải có return
    return getNewBoard
  } catch (error) {
    throw error
  }
}
const getDetails = async (boardID) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const board = await boardModel.getDetails(boardID)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }

    //https://www.javascripttutorial.net/javascript-primitive-vs-reference-values/
    const resBoard = cloneDeep(board)
    //Dua card ve dung columns cua no
    resBoard.columns.forEach(column => {
      column.cards = resBoard.cards.filter(card => {
        return card.columnId.toString() === column._id.toString()
      })
      // //Cach dung .equals la boi vi ObjectID trong MongoDB co support method equals
      // column.cards = resBoard.cards.filter(card => {
      //   return card.columnId.equals(column._id)
      // })
    })
    //Xoa cards
    delete resBoard.cards

    return resBoard
  } catch (error) {
    throw error
  }
}
const update = async (boardID, reqBody) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardID, updateData)

    return updatedBoard
  } catch (error) {
    throw error
  }
}

const moveCardInDifferentColumn = async (reqBody) => {

  try {
    // Khi di chuyen card sang  column khac:
    // B1: Cap nhat cardOrderIds cua column ban dau chua no  (xoa _id khoi mang)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    })
    // B2: Cap  nhat  mang  cardOrderIds cua column tiep theo
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now()
    })
    // B3: Cap nhat lai truong  columnId  moi  cua card da keo
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId
    })
    //=>lam 1 API support rieng
    return { updateResult: 'Successfully!' }
  } catch (error) {
    throw error
  }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardInDifferentColumn
}
