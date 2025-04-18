/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import { corsOptions } from '~/config/cors'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_V1 } from '~/routes/v1'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware'
import cookieParser from 'cookie-parser'


const START_SERVER = () => {
  const app = express()

  // Fix lỗi Cache from disk của expressJs
  // https://stackoverflow.com/a/53240717/8324172
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  // Cau hinh cookieParser
  app.use(cookieParser())

  // Xu ly CORS
  app.use(cors(corsOptions))

  //Enable  req.body  json data
  app.use(express.json())
  //Use APIs v1
  app.use('/v1', APIs_V1)
  //Middleware xu ly loi tap trung
  app.use(errorHandlingMiddleware)

  if (env.BUILD_MODE === 'production') {
    app.listen(process.env.PORT, () => {
      console.log(`3. Production: ${env.AUTHOR}, I am running at Port:  ${process.env.PORT}`)
    })
  } else {
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(`3. Local Dev: ${env.AUTHOR}, I am running at http://${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}/v1/`)
    })
  }

  //Thuc hien cac tac vu khi cleanup truoc khi dung server
  //https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
  exitHook(() => {
    console.log('4. Server is shutting down....')
    CLOSE_DB()
    console.log('5. Disconnected from mongoDB Cloud Atlas')
  })
}

//Chi khi ket noi databse thanh cong thi moi Start Server BackEnd len
//Immediately-invoked / Anonymous  Async Functions  (IIFE)
(async () => {
  try {
    console.log('1. Connecting To MongoDB Cloud Atlass....')
    await CONNECT_DB()
    console.log('2. Connected to MongoDB Cloud Atlas')
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()

//Chi khi ket noi databse thanh cong thi moi Start Server BackEnd len
// CONNECT_DB()
//   .then(() => console.log('Connected to MongoDB Cloud Atlas'))
//   .then(() => START_SERVER())
//   .catch(error => {
//     console.error(error)
//     process.exit(0)
//   })