//
import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardValidation } from '~/validations/boardValidation'
import { boardController } from '~/controllers/boardController'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

// Router.route('/:id') =>truyen id vao route
// /v1/boards
Router.route('/')
  .get(authMiddleware.isAuthorized, boardController.getBoards)
  .post(authMiddleware.isAuthorized, boardValidation.createNew, boardController.createNew)

Router.route('/:id')
  .get(authMiddleware.isAuthorized, boardController.getDetails)
  .put(authMiddleware.isAuthorized, boardValidation.update, boardController.update)//update

//API ho tro di chuyen card giua cac column  khac  nhau
Router.route('/supports/moving_cards')
  .put(authMiddleware.isAuthorized, boardValidation.moveCardInDifferentColumn, boardController.moveCardInDifferentColumn)
export const boardRoute = Router
