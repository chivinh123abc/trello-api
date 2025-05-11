export const inviteUserToBoardSocket = (socket) => {
  // console.log('a user connected', socket.id)
  // Lang nghe su kien ma client emit len ten la FE_USER_INVITED_TO_BOARD
  socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
    // Cach lam nhanh va don  gian nhat : Emit nguoc lai 1 event ve cho moi client khac(tru chinh nguoi gui), roi FE check
    socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
  })
}