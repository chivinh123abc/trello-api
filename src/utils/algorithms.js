//https://www.mongodb.com/docs/manual/reference/method/cursor.skip/#pagniation-example

// Tính toán giá trị skip phục vụ các tác vụ phân trang
export const pagingSkipValue = (page, itemsPerPage) => {
  // Luôn đảm bảo nếu giá trị không hợp lệ thì return về 0 hết
  if (!page || !itemsPerPage) return 0
  if (page <= 0 || itemsPerPage <= 0) return 0
  /**
   * Giải thích công thức đơn giản dễ hiểu
   * Ví dụ trường hợp mỗi page hiển thị 12 spham (itemsPerPage=12)
   * Case 01: User đứng ở page 1 (page = 1) thì sẽ lấy 1 - 1 = 0 sau đó nhân với 12 thì cũng = 0, lúc này giá trị skip là 0, nghĩa là k skip
   * Case 02: User đứng ở page 2 (page = 2) thì lấy 2 - 1 = 2 sau đó nhân 12 thì ra giá trị skip là 12
   * vv.........................
   */
  return (page - 1) * itemsPerPage
}
