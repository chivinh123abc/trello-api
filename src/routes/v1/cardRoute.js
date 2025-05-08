///
import express from 'express'
import { cardValidation } from '~/validations/cardValidation'
import { cardController } from '~/controllers/cardController'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { multerUploadMiddleWare } from '~/middlewares/multerUploadMiddleware'
const Router = express.Router()

// Router.route('/:id') =>truyen id vao route
Router.route('/')
  .post(authMiddleware.isAuthorized, cardValidation.createNew, cardController.createNew)

Router.route('/:id')
  .put(
    authMiddleware.isAuthorized,
    multerUploadMiddleWare.upload.single('cardCover'),
    cardValidation.update,
    cardController.update
  )

export const cardRoute = Router
