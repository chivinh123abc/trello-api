/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
const MONGODB_URI = 'mongodb+srv://RyanLuong:jFKvy28gwZYXIhc5@cluster0.4ltucma.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

const DATABASE_NAME = 'trello-ryanluong-mern-stack-pro'

import { MongoClient, ServerApiVersion } from 'mongodb'

// tao mot doi tuong trelloDatabaseInstant ban dau la null (vi chua connect)
let trelloDatabaseInstance = null

// khoi tao mot doi tuong ClientInstance de connect toi MongoDb
const mongoClientInstance = new MongoClient(MONGODB_URI, {
  // Lưu  ý: serverApi  có từ phiên bản MongoDB 5.0.0 trở lên, có thể khong cần dùng nó,
  // Còn nếu dùng nó là ta sẽ chỉ định 1 cái Stable Api version của MongoDB
  // Đoc thêm ở :  https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/connect/#connection-guide
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

//Ket noi toi Database
export const CONNECT_DB = async () => {
  // Gọi  kết nối tới MongoDB Atlas với URI đã  khai báo trong thân của client Instant
  await mongoClientInstance.connect()

  // Kết nối thành công thì lấy ra Database theo tên và gán ngược nó lại vào biến trelloDatabaseinstance ơ tren của chúng ta
  trelloDatabaseInstance = mongoClientInstance.db(DATABASE_NAME)
}

// Đóng kết nối đến database khi cần
export const CLOSE_DB = async () => {
  console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaa')
  await mongoClientInstance.close()
}

//Function GET_DB (không async) có nhiệm vụ export TrelloDatabaseInstance sau khi connect
//thanh cong tới MongoDB để chúng ta sử dùng ở nhiều nơi khác trong code
// Lưu Ý: phải đảm bảo chỉ luôn gọi GET_DB sau khi đã kết nối thành công tới MongoDB
export const GET_DB = () => {
  if (!trelloDatabaseInstance) throw new Error('Must connect to database first!!')
  return trelloDatabaseInstance
}