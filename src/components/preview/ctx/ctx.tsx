import { createContext, useEffect, useRef, useState } from "react";
import { IVideoContext, IVideoProvider } from "./types";

export const videoContext = createContext<IVideoContext>({
  startTime: 0,
  setStartTime: (time: number) => {},
  endTime: 0,
  setEndTime: (time: number) => {},
  isOn: false,
  setIsOn: () => {},
  isOnTrim: false,
  setIsOnTrim: () => {},
});

const Provider = videoContext.Provider;

export const VideoProvider = ({ children }: IVideoProvider) => {
  const [isOn, setIsOn] = useState(false);
  const [isOnTrim, setIsOnTrim] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (video?.current) {
      video.current.addEventListener("timeupdate", handleUpdate);
      video.current.addEventListener("play", handlePlay);
    }
    handleUpdate();

    return () => {
      if (video?.current) {
        video.current.removeEventListener("timeupdate", handleUpdate);
        video.current.removeEventListener("play", handlePlay);
      }
    };
  }, [video?.current, isOn, startTime, endTime]);

  const handleUpdate = () => {
    if (!video?.current || !isOn) {
      return;
    }

    if (video.current.currentTime > endTime) {
      video.current.pause();
      video.current.currentTime = endTime;
    }

    if (video.current.currentTime < startTime) {
      video.current.pause();
      video.current.currentTime = startTime;
    }
  };

  const handlePlay = () => {
    if (!video?.current || !isOn) {
      return;
    }
    if (Math.round(video.current.currentTime) >= Math.round(endTime)) {
      video.current.currentTime = startTime;
    }
  };

  const value = {
    video,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    isOn,
    setIsOn,
    isOnTrim,
    setIsOnTrim,
  };

  return <Provider value={value}>{children}</Provider>;
};
