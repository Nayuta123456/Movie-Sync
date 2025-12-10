import {
    CaptionButton,
    FullscreenButton,
    isTrackCaptionKind,
    MuteButton,
    PIPButton,
    PlayButton,
    Tooltip,
    useMediaState,
    useMediaPlayer,
    type TooltipPlacement,
} from '@vidstack/react';
import {
    ClosedCaptionsIcon,
    ClosedCaptionsOnIcon,
    FullscreenExitIcon,
    FullscreenIcon,
    MuteIcon,
    PauseIcon,
    PictureInPictureExitIcon,
    PictureInPictureIcon,
    PlayIcon,
    VolumeHighIcon,
    VolumeLowIcon,
} from '@vidstack/react/icons';
import { socket } from './socket';
import { ClientMessage } from '@/lib/types/message';
import { useStore } from '@nanostores/react';
import { $userInfo } from '@/store/player';

export interface MediaButtonProps {
    tooltipPlacement: TooltipPlacement;
    roomName: string;
}

export const buttonClass =
    'group ring-media-focus relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md outline-none ring-inset hover:bg-white/20 data-[focus]:ring-4';

export const tooltipClass =
    'animate-out fade-out slide-out-to-bottom-2 data-[visible]:animate-in data-[visible]:fade-in data-[visible]:slide-in-from-bottom-4 z-10 rounded-sm bg-black/90 px-2 py-0.5 text-sm font-medium text-white parent-data-[open]:hidden';

export function Play({ tooltipPlacement, roomName }: MediaButtonProps) {
    const isPaused = useMediaState('paused');
    const player = useMediaPlayer();
    const userInfo = useStore($userInfo);

    const handleClick = () => {
        if (isPaused) {
            // 先本地播放，再广播
            player?.play();
            socket.emit('play', JSON.stringify({
                room: roomName,
                username: userInfo?.username
            } as ClientMessage));
        } else {
            // 先本地暂停，再广播
            player?.pause();
            socket.emit('pause', JSON.stringify({
                room: roomName,
                username: userInfo?.username
            } as ClientMessage));
        }
    };

    return (
        <Tooltip.Root>
            <Tooltip.Trigger asChild>
                <button className={buttonClass} onClick={handleClick}>
                    {isPaused ? <PlayIcon className="w-6 h-6" /> : <PauseIcon className="w-6 h-6" />}
                </button>
            </Tooltip.Trigger>
            <Tooltip.Content className={tooltipClass} placement={tooltipPlacement}>
                {isPaused ? 'Play' : 'Pause'}
            </Tooltip.Content>
        </Tooltip.Root>
    );
}

export function Mute({ tooltipPlacement }: MediaButtonProps) {
    const volume = useMediaState('volume'),
        isMuted = useMediaState('muted');
    return (
        <Tooltip.Root>
            <Tooltip.Trigger asChild>
                <MuteButton className={buttonClass}>
                    {isMuted || volume == 0 ? (
                        <MuteIcon className="w-6 h-6" />
                    ) : volume < 0.5 ? (
                        <VolumeLowIcon className="w-6 h-6" />
                    ) : (
                        <VolumeHighIcon className="w-6 h-6" />
                    )}
                </MuteButton>
            </Tooltip.Trigger>
            <Tooltip.Content className={tooltipClass} placement={tooltipPlacement}>
                {isMuted ? 'Unmute' : 'Mute'}
            </Tooltip.Content>
        </Tooltip.Root>
    );
}

export function Caption({ tooltipPlacement }: MediaButtonProps) {
    const track = useMediaState('textTrack'),
        isOn = track && isTrackCaptionKind(track);
    return (
        <Tooltip.Root>
            <Tooltip.Trigger asChild>
                <CaptionButton className={buttonClass}>
                    {isOn ? (
                        <ClosedCaptionsOnIcon className="w-6 h-6" />
                    ) : (
                        <ClosedCaptionsIcon className="w-6 h-6" />
                    )}
                </CaptionButton>
            </Tooltip.Trigger>
            <Tooltip.Content className={tooltipClass} placement={tooltipPlacement}>
                {isOn ? 'Closed-Captions Off' : 'Closed-Captions On'}
            </Tooltip.Content>
        </Tooltip.Root>
    );
}

export function PIP({ tooltipPlacement }: MediaButtonProps) {
    const isActive = useMediaState('pictureInPicture');
    return (
        <Tooltip.Root>
            <Tooltip.Trigger asChild>
                <PIPButton className={buttonClass}>
                    {isActive ? (
                        <PictureInPictureExitIcon className="w-6 h-6" />
                    ) : (
                        <PictureInPictureIcon className="w-6 h-6" />
                    )}
                </PIPButton>
            </Tooltip.Trigger>
            <Tooltip.Content className={tooltipClass} placement={tooltipPlacement}>
                {isActive ? 'Exit PIP' : 'Enter PIP'}
            </Tooltip.Content>
        </Tooltip.Root>
    );
}

export function Fullscreen({ tooltipPlacement }: MediaButtonProps) {
    const isActive = useMediaState('fullscreen');
    return (
        <Tooltip.Root>
            <Tooltip.Trigger asChild>
                <FullscreenButton className={buttonClass}>
                    {isActive ? (
                        <FullscreenExitIcon className="w-6 h-6" />
                    ) : (
                        <FullscreenIcon className="w-6 h-6" />
                    )}
                </FullscreenButton>
            </Tooltip.Trigger>
            <Tooltip.Content className={tooltipClass} placement={tooltipPlacement}>
                {isActive ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            </Tooltip.Content>
        </Tooltip.Root>
    );
}
