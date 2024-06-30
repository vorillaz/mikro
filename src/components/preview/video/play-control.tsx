import React, { useRef, useEffect, useState } from "react";
import { useToggle } from "@/hooks/use-toggle";
import {
  Play as PlayIcon,
  Pause as PauseIcon,
  CantPlay as CantPlayIcon,
} from "../../icons/media";
import { cn } from "@/utils/helpers";

export const PlayControl = ({
  videoRef,
}: {
  videoRef: React.MutableRefObject<HTMLVideoElement>;
}) => {
  const [isPlaying, setIsPlaying, toggleIsPlaying] = useToggle(false);
  const [error, setError] = useState<boolean>(false);

  const togglePlay = () => {
    if (error) return;
    isPlaying ? videoRef.current?.pause() : videoRef.current?.play();
  };

  const onError = (): void => {
    setError(true);
  };

  const onPlay = () => {
    setIsPlaying(true);
  };

  const onPause = () => {
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.addEventListener("play", onPlay);
    videoRef.current.addEventListener("pause", onPause);
    videoRef.current.addEventListener("error", onError);

    return () => {
      videoRef.current?.removeEventListener("play", onPlay);
      videoRef.current?.removeEventListener("pause", onPause);
      videoRef.current?.removeEventListener("error", onError);
      setIsPlaying(false);
    };
  }, [videoRef]);

  return (
    <button
      tabIndex={-1}
      onClick={togglePlay}
      className={cn(
        "absolute rounded-full bg-black/50 p-3 shadow-[0_0px_25px_3px_rgba(0,0,0,0.2)] outline-none hover:visible peer-hover:visible top-1/2 left-1/2 transition-all z-10 -ml-6 -mt-6 w-12 h-12 flex items-center justify-center",
        error ? "cursor-not-allowed" : "cursor-pointer"
      )}
    >
      {error ? <CantPlayIcon /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
    </button>
  );
};
