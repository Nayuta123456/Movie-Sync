import { Player } from '@/components/player';
import { socket } from '@/components/socket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserList } from '@/components/user-list';
import { ClientMessage, ServerMessage } from '@/lib/types/message';
import { $playerState, $userInfo, $userStatus, $syncTrigger } from '@/store/player';
import { useStore } from '@nanostores/react';
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react';

export default function Page() {
    const router = useRouter()
    const userInfo = useStore($userInfo);
    const playerState = useStore($playerState);
    const userStatus = useStore($userStatus);
    const [usernameInput, setUsernameInput] = useState<string>('');
    const [urlInput, setUrlInput] = useState<string>('');
    const [joined, setJoined] = useState(false);

    const roomName = router.query.room as string

    // 计算其他用户数量
    const otherUsersCount = userStatus.filter(u => u.username !== userInfo?.username).length;

    // 同步时间
    const handleSyncTime = () => {
        $syncTrigger.set(Date.now());
    };

    // 监听 socket 事件，确保在 Player 组件渲染前就能接收到 URL
    useEffect(() => {
        function onRootInit(d: any) {
            const msg = JSON.parse(d) as ServerMessage
            console.log('root init', msg);
            if (msg.url) {
                $playerState.set({
                    url: msg.url,
                    inited: true
                })
                setUrlInput(msg.url);
            }
        }

        function onSetUrl(d: any) {
            console.log('set url: ', JSON.parse(d) as ServerMessage);
            const msg = JSON.parse(d) as ServerMessage
            if (msg.url) {
                $playerState.set({
                    ...playerState,
                    url: msg.url
                })
                setUrlInput(msg.url);
            }
        }

        socket.on('rootinit', onRootInit);
        socket.on('setUrl', onSetUrl);

        return () => {
            socket.off('rootinit', onRootInit);
            socket.off('setUrl', onSetUrl);
        }
    }, [playerState]);

    // 当 playerState.url 更新时，同步到输入框
    useEffect(() => {
        if (playerState?.url) {
            setUrlInput(playerState.url);
        }
    }, [playerState?.url]);

    const handleJoin = () => {
        if (!usernameInput.trim()) return;
        $userInfo.set({ username: usernameInput.trim(), joined: true });
        socket.connect();
        socket.emit('join', JSON.stringify({
            username: usernameInput.trim(),
            room: roomName,
        } as ClientMessage));
        setJoined(true);
    };

    const handleSetUrl = () => {
        if (!urlInput.trim()) return;
        $playerState.set({ ...playerState, url: urlInput.trim() });
        socket.emit('setUrl', JSON.stringify({
            room: roomName,
            username: userInfo?.username,
            url: urlInput.trim()
        } as ClientMessage));
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-100'>
            {/* 顶部标题栏 */}
            <div className='bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-white py-4 px-6 shadow-lg'>
                <div className='max-w-7xl mx-auto flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <span className='text-3xl'>🎬</span>
                        <div>
                            <h1 className='text-xl font-bold'>童童和玩赖鬼的专属电影院</h1>
                            <p className='text-sm text-pink-100'>房间: {roomName}</p>
                        </div>
                    </div>
                    {joined && userInfo?.username && (
                        <div className='flex items-center gap-2 bg-white/20 rounded-full px-4 py-2'>
                            <span className='text-lg'>👤</span>
                            <span className='font-medium'>{userInfo.username}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className='max-w-7xl mx-auto p-4'>
                <div className='flex flex-col lg:flex-row gap-4'>
                    {/* 播放器区域 */}
                    <div className='flex-1'>
                        {playerState?.url ? (
                            <div className='rounded-2xl overflow-hidden shadow-2xl bg-black'>
                                <Player roomName={roomName} />
                            </div>
                        ) : (
                            <div className='aspect-video bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl flex flex-col items-center justify-center shadow-xl'>
                                <span className='text-6xl mb-4'>🎥</span>
                                <p className='text-purple-600 text-lg font-medium'>等待输入视频链接...</p>
                                <p className='text-purple-400 text-sm mt-2'>在右侧输入视频地址开始观看</p>
                            </div>
                        )}
                    </div>

                    {/* 控制面板 */}
                    <div className='w-full lg:w-[380px] space-y-4'>
                        {/* 加入房间卡片 */}
                        {!joined && roomName && (
                            <div className='bg-white rounded-2xl shadow-xl p-6 border border-pink-100'>
                                <div className='flex items-center gap-2 mb-4'>
                                    <span className='text-2xl'>🎫</span>
                                    <h2 className='text-lg font-bold text-gray-700'>加入房间</h2>
                                </div>
                                <div className='space-y-3'>
                                    <Input
                                        value={usernameInput}
                                        onChange={(e) => setUsernameInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                                        placeholder='输入你的昵称'
                                        className='border-pink-200 focus:border-pink-400 focus:ring-pink-400'
                                    />
                                    <Button
                                        onClick={handleJoin}
                                        className='w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium py-2 rounded-xl transition-all duration-300 hover:shadow-lg'
                                    >
                                        ✨ 加入房间
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* 视频控制卡片 */}
                        {joined && (
                            <div className='bg-white rounded-2xl shadow-xl p-6 border border-purple-100'>
                                <div className='flex items-center gap-2 mb-4'>
                                    <span className='text-2xl'>🔗</span>
                                    <h2 className='text-lg font-bold text-gray-700'>视频控制</h2>
                                </div>
                                <div className='space-y-3'>
                                    <Input
                                        value={urlInput}
                                        onChange={(e) => setUrlInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSetUrl()}
                                        placeholder='输入视频直链 (MP4/M3U8)'
                                        className='border-purple-200 focus:border-purple-400 focus:ring-purple-400'
                                    />
                                    <Button
                                        onClick={handleSetUrl}
                                        className='w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-medium py-2 rounded-xl transition-all duration-300 hover:shadow-lg'
                                    >
                                        🎬 设置视频
                                    </Button>
                                    {playerState?.url && (
                                        <Button
                                            onClick={handleSyncTime}
                                            disabled={otherUsersCount === 0}
                                            className='w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 rounded-xl transition-all duration-300 hover:shadow-lg'
                                        >
                                            🔄 同步进度 {otherUsersCount > 0 ? `(${otherUsersCount}人在线)` : '(无其他用户)'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 用户列表卡片 */}
                        {roomName && (
                            <div className='bg-white rounded-2xl shadow-xl p-6 border border-indigo-100'>
                                <div className='flex items-center gap-2 mb-4'>
                                    <span className='text-2xl'>👥</span>
                                    <h2 className='text-lg font-bold text-gray-700'>在线观众</h2>
                                </div>
                                <UserList roomName={roomName} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 底部装饰 */}
            <div className='fixed bottom-4 left-1/2 -translate-x-1/2 text-center text-sm text-purple-400'>
                <p>💕 童童和玩赖鬼的专属小窝 💕</p>
            </div>
        </div>
    );
}