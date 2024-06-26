import { useContext, useState, useEffect } from "react";
import { videoContext } from "../../context/videoContext";
import Play from "./Play";
import Pause from "./Pause";
import "./Controls.scss";

function Controls() {
  const { video, isOn } = useContext(videoContext);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(video?.current?.currentTime || 0);
    };

    video?.current?.addEventListener("timeupdate", updateTime);

    return () => {
      video?.current?.removeEventListener("timeupdate", updateTime);
    };
  }, []);

  useEffect(() => {
    if (video?.current?.paused) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  }, [video?.current?.currentTime]);

  const togglePlayPause = () => {
    if (isOn) {
      if (video?.current?.paused) {
        setIsPlaying(true);
        video?.current?.play();
      } else {
        setIsPlaying(false);
        video?.current?.pause();
      }
    }
  };
  return (
    <div className="controls-container">
      <div className="controls">
        <div onClick={togglePlayPause} className="button-container">
          {isPlaying ? <Pause /> : <Play />}
        </div>
      </div>
      <div className="progress-bar">
        <div
          className="progress"
          style={{
            width: `${
              (currentTime / (video?.current?.duration as number)) * 100
            }%`,
          }}
        ></div>
      </div>
    </div>
  );
}

export default Controls;
