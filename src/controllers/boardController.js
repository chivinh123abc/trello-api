import { StatusCodes } from 'http-status-codes'
import { boardService } from '~/services/boardService'

const createNew = async (req, res, next) => {
  try {
    // console.log('req.body: ', req.body)
    // console.log('req.query: ', req.query)
    // console.log('req.params: ', req.params)
    // console.log('req.files: ', req.files)
    // console.log('req.cookies: ', req.cookies)
    // console.log('req.jwtDecoded: ', req.jwtDecoded)
    const userId = req.jwtDecoded._id
    // Điều  hướng data sang tầng Service
    const createdBoard = await boardService.createNew(userId, req.body)

    //có kết quả thì trả về phia Client
    res.status(StatusCodes.CREATED).json(createdBoard)
  } catch (error) {
    next(error)
  }
}

const getDetails = async (req, res, next) => {
  try {
    // console.log('req.params: ', req.params)
    const userId = req.jwtDecoded._id
    const boardId = req.params.id
    //Dau  nay  o khoa MERN Advance nang cao hoc truc tiep se co them userId nx de chi lay board thuocve user do thoi
    const board = await boardService.getDetails(userId, boardId)

    res.status(StatusCodes.OK).json(board)
  } catch (error) {
    next(error)
  }
}

const update = async (req, res, next) => {
  try {
    const boardId = req.params.id
    const updatedBoard = await boardService.update(boardId, req.body)

    res.status(StatusCodes.OK).json(updatedBoard)
  } catch (error) {
    next(error)
  }
}
const moveCardInDifferentColumn = async (req, res, next) => {
  try {
    // console.log('MoveCard:  ', result)
    // console.log('MoveCard:  ', req.body)
    const result = await boardService.moveCardInDifferentColumn(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) {
    next(error)
  }
}

const getBoards = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    // page va itemsPerPage duoc truyenvao trong query url tu phia FE nen BE se lay thong qua req.query
    const { page, itemPerPage, q } = req.query
    const queryFilters = q
    // console.log(queryFilters)


    const results = await boardService.getBoards(userId, page, itemPerPage, queryFilters)

    res.status(StatusCodes.OK).json(results)
  } catch (error) {
    next(error)
  }
}

export const boardController = {
  createNew,
  getDetails,
  update,
  moveCardInDifferentColumn,
  getBoards
}
