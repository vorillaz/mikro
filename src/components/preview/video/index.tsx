import { useRef, useState, useCallback, useEffect } from "react";
import { Timeline } from "./timeline";
import { addDuration } from "src/ctx/actions";
import { useDispatcher } from "src/ctx/store";
import { cn } from "@/utils/helpers";
import { useToggle } from "@/hooks/use-toggle";
import { convertFileSrc } from "@tauri-apps/api/tauri";

import {
  Play as PlayIcon,
  Pause as PauseIcon,
  Scissors as ScisscorsIcon,
} from "../../icons/media";
import { useEventListener } from "@/hooks/use-event-listener";
import {
  getAccessToken,
  getActiveFileDuration,
  getPort,
  getActiveFile,
} from "src/ctx/selectors";
import { invoke } from "@tauri-apps/api";
interface Props {
  src: string;
  file: string;
  duration: number;
}

export const VideoPreview = ({ src }: { src: string }) => {
  const token = getAccessToken();
  const port = getPort();
  const duration = getActiveFileDuration();
  const file = getActiveFile();
  const { dispatch } = useDispatcher();

  useEffect(() => {
    if (!src || !file?.id) return;

    if (duration) {
      return;
    }

    invoke<number>("get_duration", { videoPath: src })
      .then((d) => {
        dispatch(addDuration(d, file?.id));
      })
      .catch((e) => {});
    return () => {};
  }, [src, file?.id, duration]);

  let bump = `http://localhost:${port}/${src}?access_token=${token}`;

  if (!src || !file?.id || !duration) {
    return null;
  }

  bump = `stream://${src}`;
  const path = convertFileSrc(src, "stream");

  return <Video src={path} duration={duration} file={src} />;
};

export const Video = ({ src, duration, file }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying, toggleIsPlaying] = useToggle(false);
  const [trimming, setTrimming] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const togglePlay = () => {
    isPlaying ? videoRef.current?.pause() : videoRef.current?.play();
  };

  const onError = (): void => {
    setError(true);
  };

  const toggleTrimming = () => {
    setTrimming((prev) => !prev);
  };

  useEffect(() => {
    if (!videoRef.current) return;

    const onPlay = () => {
      setIsPlaying(true);
    };

    const onPause = () => {
      setIsPlaying(false);
    };

    videoRef.current.addEventListener("play", onPlay);
    videoRef.current.addEventListener("pause", onPause);

    return () => {
      videoRef.current?.removeEventListener("play", onPlay);
      videoRef.current?.removeEventListener("pause", onPause);
      setIsPlaying(false);
    };
  }, [videoRef]);

  useEventListener("keydown", (e) => {
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
    }
  });

  return (
    <div
      ref={wrapperRef}
      className="video-preview flex flex-col px-8 py-4 relative w-full"
    >
      <div
        id="video-preview-wrapper"
        className="relative w-full justify-center flex-1"
      >
        {/*  */}
        <div className="video-holder relative aspect-video flex items-center justify-center">
          <video
            onError={onError}
            ref={videoRef}
            src={src}
            preload="auto"
            playsInline
            muted
            controls
          ></video>
          <button
            tabIndex={-1}
            onClick={togglePlay}
            className={
              "absolute cursor-pointer rounded-full bg-black/50 p-3 shadow-[0_0px_25px_3px_rgba(0,0,0,0.2)] outline-none hover:visible peer-hover:visible top-1/2 left-1/2 transition-all z-10 -ml-6 -mt-6 w-12 h-12 flex items-center justify-center"
            }
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>

          <button
            onClick={toggleTrimming}
            className="absolute cursor-pointer top-4 left-4 z-20 flex items-center justify-center bg-black/50 p-2 rounded-md shadow-[0_0px_25px_3px_rgba(0,0,0,0.2)] text-white"
          >
            <ScisscorsIcon size={15} />
            <span>Trim</span>
          </button>
        </div>
        <div
          className={cn(
            "invisible  bottom-0 w-full left-0",
            trimming ? "visible" : "invisible"
          )}
        >
          <Timeline
            videoRef={videoRef}
            duration={duration}
            src={src}
            file={file}
          />
        </div>
      </div>
    </div>
  );
};
