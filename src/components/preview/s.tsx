import {
  useRef,
  useState,
  useEffect,
  type FormEventHandler,
  type MouseEventHandler,
} from "react";
import { Frames } from "./video/frames";
import { Play as PlayIcon, Pause as PauseIcon } from "../icons/media";
import { invoke } from "@tauri-apps/api";

import { getAccessToken, getPort, getActiveFile } from "src/ctx/selectors";
import { useToggle } from "@/hooks/use-toggle";
import { useDebounced } from "@/hooks/use-debounced";
import { useEventListener } from "@/hooks/use-event-listener";
import { cn, formatTime } from "@/utils/helpers";
import { addDuration } from "../../ctx/actions";
import { useDispatcher } from "../../ctx/store";

const step = 0.01;

export const VideoPreview = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const seekRef = useRef<HTMLInputElement>(null);
  const trimmerRef = useRef<HTMLDivElement>(null);
  const trimStartRef = useRef<HTMLDivElement>(null);
  const trimEndRef = useRef<HTMLDivElement>(null);

  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(100);
  const [error, setError] = useState<boolean>(false);
  const [isTrimming, setIsTrimming, toggleIsTrimming] = useToggle(false);

  const [isPlaying, setIsPlaying, toggleIsPlaying] = useToggle(false);

  const token = getAccessToken();
  const port = getPort();
  const file = getActiveFile();
  const { dispatch } = useDispatcher();

  useEffect(() => {
    if (!src || !file?.id) return;

    invoke<number>("get_duration", { videoPath: src })
      .then((duration) => {
        dispatch(addDuration(duration, file?.id));
      })
      .catch((e) => {});
    return () => {};
  }, [src, file?.id]);

  const togglePlay = (): void => {
    if (!videoRef.current) return;
    if (error) {
      return;
    }
    isPlaying ? videoRef.current?.pause() : videoRef.current?.play();
    toggleIsPlaying();
  };

  const play = (): void => {
    videoRef.current?.play();
    setIsPlaying(true);
  };

  const onError = (): void => {
    setError(true);
  };

  useEffect(() => {
    if (!videoRef.current) return;
    if (!seekRef.current) return;

    const updateSeek = () => {
      const seek = seekRef.current;
      const video = videoRef.current;
      const wrapper = wrapperRef.current;
      const value = (100 / video.duration) * video.currentTime;
      seek.value = value.toFixed(2);
      seek.setAttribute("current-time", formatTime(video.currentTime));
      const thumbPosition = (seek.clientWidth * value) / 100;
      seek.style.setProperty("--label-position", `${thumbPosition}px`);
    };

    const onMove = () => {
      requestAnimationFrame(updateSeek);
    };

    const onEnd = (e) => {
      const duration = e?.target?.duration || 0;
      const currentTime = e?.target?.currentTime || 0;
      const videoStart = (duration * start) / 100;

      const seek = seekRef.current;

      console.log(seek.valueAsNumber);

      console.log(end);
    };

    videoRef?.current?.addEventListener("timeupdate", onMove);
    videoRef?.current?.addEventListener("timeupdate", onEnd);
    videoRef?.current?.addEventListener("seeked", onMove);

    return () => {
      videoRef.current?.pause();
      videoRef.current?.removeEventListener("timeupdate", onMove);
      videoRef.current?.removeEventListener("timeupdate", onEnd);
      videoRef.current?.removeEventListener("seeked", onMove);
      setIsPlaying(false);
    };
  }, [videoRef, seekRef]);

  const syncVideoWithSeekValue: FormEventHandler<HTMLInputElement> = () => {
    if (!seekRef.current || !videoRef.current) return;
    const seek = seekRef.current;
    const video = videoRef.current;
    const time = video.duration * (Number(seek.value) / 100);
    const videoStart = (video.duration * start) / 100;

    if (seek.valueAsNumber >= end) {
      video.currentTime = videoStart;
    } else if (video.currentTime < videoStart) {
      video.currentTime = videoStart;
    } else {
      video.currentTime = time;
    }
  };

  const onMouseDown: MouseEventHandler<HTMLInputElement> = () => {
    videoRef.current?.pause();
    setIsPlaying(false);
  };

  const onMouseUp: MouseEventHandler<HTMLInputElement> = useDebounced(
    (event) => {},
    350
  );

  const trimVideo = (): void => {
    if (!videoRef.current) return;
    const videoStart = (videoRef.current.duration * start) / 100;
    videoRef.current.currentTime = videoStart;
  };

  const onTrim = (e: React.MouseEvent, isEnd: boolean): void => {
    if (!videoRef.current) return;
    e.preventDefault();
    const trimmer = videoRef.current;
    const startX = e.clientX;
    const initialLeft = isEnd ? end : start;

    const onDrag = (moveEvent: MouseEvent) => {
      if (!videoRef.current) return;
      const delta = moveEvent.clientX - startX;
      const newPos = initialLeft + (delta / trimmer.clientWidth) * 100;

      if (isEnd) {
        if (newPos <= 100 && newPos >= start) {
          setEnd(newPos);
        }
      } else {
        if (newPos >= 0 && newPos <= end) {
          setStart(newPos);
        }
      }
    };

    const onDragEnd = () => {
      document.removeEventListener("mousemove", onDrag);
      document.removeEventListener("mouseup", onDragEnd);

      console.log("end", end);
      console.log("start", start);
    };

    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", onDragEnd);
  };

  useEventListener("keydown", (e) => {
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      togglePlay();
    }
  });

  return (
    <div
      ref={wrapperRef}
      className="video-preview flex flex-col gap-12 h-full px-8 py-4 relative w-full"
    >
      <div
        id="video-preview-wrapper"
        className="relative w-full justify-center flex-1"
      >
        <div className="wrapper flex relative justify-center w-full h-full">
          <video
            ref={videoRef}
            onClick={togglePlay}
            className="peer relative cursor-pointer rounded-sm"
            onError={onError}
            src={`http://localhost:${port}/${src}?access_token=${token}`}
            muted
            loop
          >
            Your browser doesn't support <code>HTML5 video</code>
          </video>
        </div>

        <button
          onClick={toggleIsTrimming}
          className="absolute cursor-pointer top-4 left-4 z-20"
        >
          Trim
        </button>

        <button
          tabIndex={-1}
          onClick={togglePlay}
          className={cn(
            "invisible absolute cursor-pointer rounded-full bg-black/50 p-3 shadow-[0_0px_25px_3px_rgba(0,0,0,0.2)] outline-none hover:visible peer-hover:visible top-1/2 left-1/2 transition-all z-10 -ml-6 -mt-6 w-12 h-12 flex items-center justify-center",
            !isPlaying ? "visible" : "invisible"
          )}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>

      <div
        data-id="trim-holder"
        className="relative flex h-16 justify-between rounded-xl bg-card w-full"
      >
        <div
          id="gap-start"
          className="absolute h-full left-0 z-10 bg-noop select-none touch-none pointer-events-none	overflow-hidden rounded-l-xl"
          style={{ width: `${start}%` }}
        ></div>
        <div
          ref={trimmerRef}
          id="trimmer"
          className="absolute bottom-0 h-[64px] cursor-grab border-b-4 border-t-4 border-yellow shadow"
          style={{ left: `${start}%`, width: `${end - start}%` }}
        >
          <div
            onMouseDown={(e) => onTrim(e, false)}
            onMouseUp={trimVideo}
            ref={trimStartRef}
            id="trim-start"
            className="group absolute -bottom-1 -top-1 z-20 w-5 cursor-ew-resize rounded-[0.75rem_0_0_0.75rem] border-b-0 border-r-0 border-t-0 bg-yellow"
            style={{ left: "-16px" }}
          >
            <div className="pointer-events-none absolute left-[8px] top-5 block h-6 w-1 rounded-[2px] bg-inner transition-all group-active:scale-y-[1.1] group-active:bg-inner" />
          </div>
          <div
            onMouseDown={(e) => onTrim(e, true)}
            onMouseUp={trimVideo}
            ref={trimEndRef}
            id="trim-end"
            className="group absolute -bottom-1 -top-1 z-20 w-5 cursor-ew-resize rounded-[0_0.75rem_0.75rem_0] border-b-0 border-l-0 border-t-0 bg-yellow"
            style={{ right: "-16px" }}
          >
            <div className="pointer-events-none absolute left-[8px] top-5 block h-6 w-1 rounded-[2px] bg-inner transition-all group-active:scale-y-[1.1] group-active:bg-inner" />
          </div>
        </div>
        <div
          id="gap-end"
          className="absolute h-full right-0 z-10 bg-noop select-none touch-none pointer-events-none overflow-hidden rounded-r-xl"
          style={{ width: `${100 - end}%` }}
        ></div>
        <input
          id="seek"
          min="0"
          max="100"
          step={step}
          defaultValue="0"
          type="range"
          ref={seekRef}
          onInput={syncVideoWithSeekValue}
          className="seek absolute z-10 w-full"
        />
        <div className="flex justify-between overflow-clip rounded-xl w-full">
          <div className="flex justify-between w-full">
            <Frames video={videoRef} wrapper={wrapperRef} src={src} />
          </div>
        </div>
      </div>
    </div>
  );
};
