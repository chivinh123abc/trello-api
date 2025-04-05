//
import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'

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

export const boardService = {
  createNew
}
