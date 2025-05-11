import { StatusCodes } from 'http-status-codes'
import { boardModel } from '~/models/boardModel'
import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { pickUser } from '~/utils/formatters'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { invitationModel } from '~/models/invitationModel'

// INVITATION_TYPES BOARD_INVITATION_STATUS
const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    // nguoi di moi
    const inviter = await userModel.findOneById(inviterId)
    // Nguioj duoc moi
    const invited = await userModel.findOneByEmail(reqBody.invitedEmail)
    // Tim board de lay data xu ly
    const board = await boardModel.findOneById(reqBody.boardId)

    // Neu khong ton tai 1 trong 3 thi reject
    if (!invited || !inviter || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invited or Board not found!')
    }

    // Tao data can thiet de luu vao trong DB
    // Co the thu bo hoac lam sai lech type, boardInvitation, status de test Model validate OK chua
    const newInvitationData = {
      inviterId,
      invitedId: invited._id.toString(),
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }
    }

    // Goi sang Model de luu vao DB
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)
    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId.toString())

    // Ngoai thong tin cua cai board invitation moi tao ra thi tra ve du ca board, inviter, invited cho FE thoai mai xu ly
    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invited: pickUser(invited)
    }
    return resInvitation

  } catch (error) {
    throw (error)
  }
}

const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId)
    // console.log('getInvitations: ', getInvitations)
    // Vi cac  data inviter and invited va  board dang la gia tri mang 1 phan  thu nen  chung ta doi ve  json Object  truoc  khi tra ve
    const resInvitations = getInvitations.map(i => {
      return {
        ...i,
        inviter: i.inviter[0] || {},
        invited: i.invited[0] || {},
        board: i.board[0] || {}
      }
    })

    return resInvitations
  } catch (error) {
    throw (error)
  }
}

const updateBoardInvitation = async (userId, invitationId, status) => {
  try {
    const getInvitation = await invitationModel.findOneById(invitationId)
    if (!getInvitation) throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found!')

    // Lay full thong tin cua board
    const boardId = getInvitation.boardInvitation.boardId
    const getBoard = await boardModel.findOneById(boardId)
    if (!getBoard) throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')

    // Kiem tra xem status la  Accepted thi join Board
    // 2 mang memberIds va ownerIds cua board dang la kieu ObjectId nen cho no ve String de check
    const boardOwnerAndMemberIds = [
      ...getBoard.ownerIds,
      ...getBoard.memberIds
    ].toString()
    if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerAndMemberIds.includes(userId)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You are already member of this board!')
    }

    // Tao du lieu de update ban ghi Invitation
    const updateData = {
      boardInvitation: {
        ...getInvitation.boardInvitation,
        status: status
      }
    }

    // Buoc 01 : Cap nhat status trong ban ghi invitation
    const updatedInvitation = await invitationModel.update(invitationId, updateData)
    // Buoc 02 : Neu Accept loi moi thanh cong, thi can phai them thong tin cua user(UserId) vao memberIds trong collectionBoard
    if (updatedInvitation.boardInvitation.status === BOARD_INVITATION_STATUS.ACCEPTED) {
      await boardModel.pushMembers(boardId, userId)
    }

    return updatedInvitation
  } catch (error) {
    throw (error)
  }
}

export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation
}