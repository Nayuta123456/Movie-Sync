import { $userInfo, $userStatus } from "@/store/player"
import { useStore } from '@nanostores/react'
import { useEffect } from "react"
import { socket } from "./socket"
import { ClientMessage } from "@/lib/types/message"

export const UserList = ({ roomName }: { roomName: string }) => {
    const userStatus = useStore($userStatus)
    const userInfo = useStore($userInfo)

    useEffect(() => {
        const interval = setInterval(() => {
            socket.emit("getRoomInfo", JSON.stringify({
                username: userInfo?.username,
                room: roomName
            } as ClientMessage))
        }, 1000)
        return () => clearInterval(interval)
    }, [userInfo?.username, roomName])

    const formatTime = (seconds: number | undefined) => {
        if (seconds === undefined || seconds === null) return '0:00'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="space-y-2">
            {userStatus.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    <span className="text-4xl block mb-2">👻</span>
                    <p className="text-sm">暂无用户在线</p>
                    <p className="text-xs mt-1">加入房间开始观影吧~</p>
                </div>
            ) : (
                userStatus.map((user) => (
                    <div
                        key={user.userID}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                            user.username === userInfo?.username
                                ? 'bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-200'
                                : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                                user.username === userInfo?.username
                                    ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white'
                                    : 'bg-gradient-to-r from-gray-300 to-gray-400 text-white'
                            }`}>
                                {user.username === userInfo?.username ? '😊' : '👤'}
                            </div>
                            <div>
                                <p className={`font-medium text-sm ${
                                    user.username === userInfo?.username
                                        ? 'text-purple-700'
                                        : 'text-gray-700'
                                }`}>
                                    {user.username || '匿名用户'}
                                    {user.username === userInfo?.username && (
                                        <span className="ml-1 text-xs text-pink-500">(我)</span>
                                    )}
                                </p>
                                <p className="text-xs text-gray-400">
                                    进度: {formatTime(user.time)}
                                </p>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.playing
                                ? 'bg-green-100 text-green-600'
                                : 'bg-yellow-100 text-yellow-600'
                        }`}>
                            {user.playing ? '▶️ 播放中' : '⏸️ 暂停'}
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}