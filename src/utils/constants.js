import { env } from '~/config/environment'

//Nhung domain dc truy cap den tai nguyen cua server
export const WHITELIST_DOMAINS = [
  // 'http://localhost:5173'
  'https://trello-web-jade.vercel.app',
  'https://trello-web-ryanluongs-projects.vercel.app/',
  'trello-d7bjos95j-ryanluongs-projects.vercel.app',

  //vi du sau nay  se deploy len  domain chinh thuc
]

export const BOARD_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'production') ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT

export const DEFAULT_ITEMS_PER_PAGE = 12
export const DEFAULT_PAGE = 1

export const INVITATION_TYPES = {
  BOARD_INVITATION: 'BOARD_INVITATION'
}

export const BOARD_INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}