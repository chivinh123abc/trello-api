/* eslint-disable no-console */
import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, GET_DB, CLOSE_DB } from '~/config/mongodb'


const START_SERVER = () => {
  const app = express()

  const hostname = 'localhost'
  const port = 8017

  app.get('/', async (req, res) => {
    console.log(await GET_DB().listCollections().toArray())
    // process.exit(0)
    res.end('<h1>Hello World!</h1><hr>')
  })

  app.listen(port, hostname, () => {
    console.log(`3. Hello RyanLuong, I am running at http://${hostname}:${port}/`)
  })

  //Thuc hien cac tac vu khi cleanup truoc khi dung server
  //https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
  exitHook(() => {
    console.log('4. Disconnecting from mongoDB Cloud Atlas')
    CLOSE_DB()
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
// Dong nay la note