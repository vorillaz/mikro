import { useContext, useEffect, useLayoutEffect, useRef } from "react";
import "./Seek.css";
import { videoContext } from "../../../context/videoContext";
import { Draggable } from "../../components/dragable/Draggable";
import { IDragStatus } from "../../components/dragable/Draggable.types";
import { formatTime } from "../../../utils/utils";

export const Seek = () => {
  const { video, isOnTrim, startTime, endTime } = useContext(videoContext);
  const seekRef = useRef<HTMLDivElement>(null);
  const touchRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (video?.current) {
      video.current.addEventListener("timeupdate", handleUpdate);
    }

    return () => {
      if (video?.current) {
        video.current.removeEventListener("timeupdate", handleUpdate);
      }
    };
  }, [video?.current, startTime, endTime]);

  useEffect(() => {
    if (video?.current) {
      setTime();
    }
  }, [video?.current, startTime, endTime]);

  const handleUpdate = () => {
    if (!video?.current || !seekRef.current || !timeRef.current) {
      return;
    }
    if (video.current.currentTime > endTime) {
      return;
    }

    const per = (video.current.currentTime / video.current.duration) * 100;
    seekRef.current.style.left = per + "%";

    setTime();
  };

  const setTime = () => {
    if (!video?.current || !timeRef.current) {
      return;
    }

    const current = Math.floor(video.current.currentTime * 100) / 100;
    const start = Math.floor(startTime * 100) / 100;

    timeRef.current.innerHTML = formatTime(current - start);
  };

  const handleMove = (diff: number, status: IDragStatus) => {
    if (!seekRef.current || !video?.current) {
      return;
    }
    const left = status.startPosition + diff;
    const parentWidth = seekRef.current.parentElement?.offsetWidth || 0;

    const per = (left / parentWidth) * 100;

    let newTime = (video.current.duration / 100) * per;

    if (newTime < startTime) {
      newTime = startTime;
    }
    if (newTime > endTime) {
      newTime = endTime;
    }

    video.current.currentTime = newTime;
  };

  return (
    <div
      className="Seek"
      ref={seekRef}
      style={{ visibility: isOnTrim ? "hidden" : "visible" }}
    >
      <Draggable
        onDrag={handleMove}
        getTarget={() => seekRef.current}
        deps={[startTime, endTime]}
      >
        <div className="touch" ref={touchRef}></div>
      </Draggable>
      <div className="time" ref={timeRef}></div>
    </div>
  );
};
