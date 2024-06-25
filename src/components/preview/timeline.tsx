import { Thumbs } from "./thumbs";
import { useContext } from "react";
import { videoContext } from "./ctx/ctx";

export const Timeline = () => {
  const { isOn } = useContext(videoContext);

  return (
    <div className="Timeline no_select" data-loading={!isOn}>
      <div>
        <Thumbs />
      </div>
    </div>
  );
};
