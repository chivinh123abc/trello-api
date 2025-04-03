//
import express from 'express'
import { StatusCodes } from 'http-status-codes'

const Router = express.Router()

Router.route('/')
  .get((req, res) => {
    res.status(StatusCodes.OK).json({ message: 'GET: APT get list boards' })
  })
  .post((req, res) => {
    res.status(StatusCodes.CREATED).json({ message: 'POST: APIs Create new boards' })
  })

export const boardRoutes = Router
