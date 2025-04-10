///
import express from 'express'
import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'
const Router = express.Router()

// Router.route('/:id') =>truyen id vao route
Router.route('/')
  .post(cardValidation.createNew, cardController.createNew)

export const cardRoute = Router
