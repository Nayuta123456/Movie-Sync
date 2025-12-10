import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Inter } from 'next/font/google'
import { useRouter } from 'next/router'
import { useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const router = useRouter()
  const [roomName, setRoomName] = useState('')

  const handleJoin = () => {
    if (roomName.trim()) {
      router.push(`/room/${roomName.trim()}`)
    }
  }

  return (
    <main className={`${inter.className} min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100`}>
      {/* 背景装饰 */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-20 left-10 text-6xl opacity-20 animate-bounce'>🎬</div>
        <div className='absolute top-40 right-20 text-5xl opacity-20 animate-pulse'>🍿</div>
        <div className='absolute bottom-32 left-1/4 text-4xl opacity-20 animate-bounce delay-100'>🎥</div>
        <div className='absolute bottom-20 right-1/3 text-5xl opacity-20 animate-pulse delay-200'>💕</div>
      </div>

      <div className='flex justify-center items-center min-h-screen px-4'>
        <div className='bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md border border-pink-100'>
          {/* Logo 区域 */}
          <div className='text-center mb-8'>
            <div className='text-6xl mb-4'>🎬</div>
            <h1 className='text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent'>
              童童和玩赖鬼的专属电影院
            </h1>
            <p className='text-gray-500 text-sm mt-2'>一起看电影，距离不是问题 💕</p>
          </div>

          {/* 表单区域 */}
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-600 mb-2'>
                🏠 房间名称
              </label>
              <Input
                placeholder='输入房间名，如：我们的小窝'
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                className='border-pink-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl py-3'
              />
            </div>

            <Button
              onClick={handleJoin}
              className='w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-medium py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02]'
            >
              ✨ 进入电影院
            </Button>
          </div>

          {/* 底部提示 */}
          <div className='mt-8 pt-6 border-t border-pink-100'>
            <div className='text-center text-sm text-gray-500'>
              <p className='mb-2'>📝 使用说明</p>
              <ul className='text-xs space-y-1 text-gray-400'>
                <li>1. 输入相同的房间名即可一起观看</li>
                <li>2. 支持 MP4、M3U8 等视频格式</li>
                <li>3. 播放进度自动同步</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 底部版权 */}
      <div className='fixed bottom-4 left-1/2 -translate-x-1/2 text-center text-sm text-purple-400'>
        <p>💕 专属于童童和玩赖鬼 💕</p>
      </div>
    </main>
  )
}
