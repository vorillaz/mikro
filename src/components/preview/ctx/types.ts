import { ReactNode, RefObject } from "react";

export interface IVideoContext {
  video?: RefObject<HTMLVideoElement>;
  startTime: number;
  setStartTime: (time: number) => void;
  endTime: number;
  setEndTime: (time: number) => void;
  isOn: boolean;
  setIsOn: (flag: boolean) => void;
  isOnTrim: boolean;
  setIsOnTrim: (flag: boolean) => void;
}

export interface IVideoProvider {
  children: ReactNode;
}
