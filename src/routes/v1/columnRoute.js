import express from 'express'
import { columnValidation } from '~/validations/columnValidation'
import { columnController } from '~/controllers/columnController'

const Router = express.Router()

// Router.route('/:id') =>truyen id vao route
Router.route('/')
  .post(columnValidation.createNew, columnController.createNew)


export const columnRoute = Router
