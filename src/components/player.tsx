import '@vidstack/react/player/styles/base.css';
import {
    MediaPlayer,
    MediaProvider,
    MediaPlayerInstance,
    isHLSProvider,
    MediaProviderAdapter,
    MediaProviderChangeEvent,
} from '@vidstack/react';
import { VideoLayout } from './video-control';
import { useEffect, useRef } from 'react';
import { socket } from './socket';
import { ClientMessage, ServerMessage } from '@/lib/types/message';
import { $playerState, $userInfo, $userStatus, $syncTrigger } from '@/store/player';
import { useStore as useNanoStore } from '@nanostores/react';
import HLS from 'hls.js';

export const Player = ({ roomName }: { roomName: string }) => {
    const userinfo = useNanoStore($userInfo);
    const player = useRef<MediaPlayerInstance>(null)
    const playerState = useNanoStore($playerState)
    const userStatus = useNanoStore($userStatus)
    const syncTrigger = useNanoStore($syncTrigger)

    // 监听同步触发器
    useEffect(() => {
        if (syncTrigger === 0) return; // 初始值不触发

        // 获取其他用户的时间
        const otherUsers = userStatus.filter(u => u.username !== userinfo?.username);
        if (otherUsers.length === 0) {
            console.log('没有其他用户可同步');
            return;
        }
        const times = otherUsers.map(user => user?.time).filter(t => t !== undefined && t !== null && t >= 0) as number[];
        if (times.length === 0) {
            return;
        }
        const mintime = Math.min(...times);
        if (player.current && mintime >= 0) {
            console.log('手动同步到:', mintime);
            player.current.currentTime = mintime;
        }
    }, [syncTrigger]);

    useEffect(() => {
        if (!player.current) {
            return
        }
        // Subscribe to state updates.
        return player.current.subscribe(({ paused, currentTime, seeking }) => {
            if (seeking) {
                socket.emit("setTime", JSON.stringify({
                    username: userinfo?.username,
                    time: Math.ceil(currentTime),
                    room: roomName
                } as ClientMessage))
                return
            }
        });
    }, [userinfo, roomName, playerState?.url]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!player.current) {
                return
            }
            socket.emit("updateMyInfo", JSON.stringify({
                username: userinfo?.username,
                time: Math.ceil(player.current.currentTime),
                room: roomName,
                playing: !player.current.paused
            } as ClientMessage))
        }, 2000)
        return () => clearInterval(interval)
    }, [userinfo?.username])

    useEffect(() => {
        function onConnect() {
            console.log('connected');
        }

        function onDisconnect(e: any, d: any) {
            console.log('disconnected, reason', e, d);
            socket.connect();
        }

        function onRootInit(d: any) {
            const msg = JSON.parse(d) as ServerMessage
            console.log('root init', msg);
            $playerState.set({
                url: msg.url,
                inited: true
            })
        }

        function onRoomInfo(d: any) {
            const msg = JSON.parse(d) as ServerMessage
            if (!msg.userStatus || msg.userStatus.length === 0) {
                return
            }
            $userStatus.set([
                ...msg.userStatus
            ])
            // 只同步其他用户的进度，不包括自己
            const otherUsers = msg.userStatus.filter(u => u.username !== userinfo?.username);
            if (otherUsers.length === 0) {
                // 房间里只有自己，不需要同步
                return;
            }
            const times = otherUsers.map(user => user?.time).filter(t => t !== undefined && t !== null && t >= 0) as number[];
            if (times.length === 0) {
                return;
            }
            const mintime = Math.min(...times);
            // 只有当差距超过10秒且 mintime 是有效值时才同步
            if (player.current && mintime >= 0 && Math.abs(player.current.currentTime - mintime) > 10) {
                console.log('syncing to mintime:', mintime, 'current:', player.current.currentTime);
                player.current.currentTime = mintime;
            }
        }

        function onPause(d: any) {
            const msg = JSON.parse(d) as ServerMessage;
            console.log('pause from:', msg.actionEmitter);
            // 忽略自己发出的暂停事件
            if (msg.actionEmitter === userinfo?.username) {
                return;
            }
            if (player.current) {
                player.current.pause();
            }
        }

        function onPlay(d: any) {
            const msg = JSON.parse(d) as ServerMessage;
            console.log('play from:', msg.actionEmitter);
            // 忽略自己发出的播放事件
            if (msg.actionEmitter === userinfo?.username) {
                return;
            }
            if (player.current && player.current?.state.canPlay) {
                player.current.play();
            }
        }

        function onSetTime(d: any) {
            console.log('set time: ', JSON.parse(d) as ServerMessage);
            const msg = JSON.parse(d) as ServerMessage
            const distUser = msg.userStatus?.find((u) => u.username === msg.actionEmitter)
            if (distUser && distUser.username !== userinfo?.username) {
                if (player.current && distUser.time) {
                    player.current.currentTime = distUser.time
                }
            }
        }

        function onSetUrl(d: any) {
            console.log('set url: ', JSON.parse(d) as ServerMessage);
            const msg = JSON.parse(d) as ServerMessage
            $playerState.set({
                url: msg.url
            })
        }
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('rootinit', onRootInit);
        socket.on('roomInfo', onRoomInfo)
        socket.on('pause', onPause)
        socket.on('play', onPlay)
        socket.on('setTime', onSetTime)
        socket.on('setUrl', onSetUrl)

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('rootinit', onRootInit);
            socket.off('roomInfo', onRoomInfo)
            socket.off('pause', onPause)
            socket.off('play', onPlay)
            socket.off('setTime', onSetTime)
            socket.off('setUrl', onSetUrl)
        }
    }, [userinfo]);

    function onProviderChange(
        provider: MediaProviderAdapter | null,
        nativeEvent: MediaProviderChangeEvent,
    ) {
        if (isHLSProvider(provider)) {
            provider.library = HLS;
        }
    }

    return (
        <div>
            {playerState?.url && <MediaPlayer
                key={playerState.url}
                className="w-full aspect-video bg-slate-900 text-white font-sans overflow-hidden rounded-md ring-media-focus data-[focus]:ring-4"
                title="test"
                src={playerState.url}
                playsinline
                onProviderChange={onProviderChange}
                ref={player}
            >
                <MediaProvider>
                </MediaProvider>
                <VideoLayout roomName={roomName} />
            </MediaPlayer>}
        </div>
    );
}