import { useRef, useState, useEffect } from "react";
import { Scissors as ScisscorsIcon } from "../../icons/media";
import { Timeline } from "./timeline";
import { cn } from "@/utils/helpers";

export const Trimming = ({ src, duration, file, videoRef }) => {
  const [trimming, setTrimming] = useState<boolean>(false);

  const toggleTrimming = () => {
    setTrimming((prev) => !prev);
  };

  return (
    <>
      <button
        onClick={toggleTrimming}
        className="absolute cursor-pointer top-4 left-4 z-20 flex items-center justify-center bg-black/50 p-2 rounded-md shadow-[0_0px_25px_3px_rgba(0,0,0,0.2)] text-white"
      >
        <ScisscorsIcon size={15} />
        <span>Trim</span>
      </button>
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
    </>
  );
};
