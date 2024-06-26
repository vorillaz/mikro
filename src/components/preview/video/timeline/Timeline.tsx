import { Seek } from "./seek/Seek";
import { Thumbs } from "./thumbs/Thumbs";
import { Trimmer } from "./trimmer/trimmer";
import "./Timeline.css";
import { useContext } from "react";
import { videoContext } from "../../context/videoContext";

export const Timeline = () => {
  const { isOn } = useContext(videoContext);

  return (
    <div className="Timeline no_select" data-loading={!isOn}>
      <div>
        <Trimmer />
        <Thumbs />
        <Seek />
      </div>
    </div>
  );
};
