import { PlayerState, UserStatus } from '@/lib/types/message'
import { UserInfo } from '@/lib/types/user'
import { atom } from 'nanostores'

export const $userStatus = atom<UserStatus[]>([])
export const $userInfo = atom<UserInfo | undefined>()
export const $playerState = atom<PlayerState | undefined>()
// 同步时间触发器，每次变化时触发同步
export const $syncTrigger = atom<number>(0)