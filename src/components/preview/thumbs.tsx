import { useContext, useEffect, useRef } from "react";
import { videoContext } from "./ctx/ctx";

export const Thumbs = () => {
  const { video, setIsOn } = useContext(videoContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (video?.current) {
      video.current.addEventListener("loadedmetadata", handleInit);
    }

    return () => {
      stopListening();
    };
  }, [video?.current]);

  const stopListening = () => {
    video?.current?.removeEventListener("loadedmetadata", handleInit);
  };

  const handleInit = () => {
    if (!canvasRef?.current || !video?.current || !wrapRef?.current) {
      return;
    }

    canvasRef.current.width = wrapRef.current.offsetWidth;
    canvasRef.current.height = wrapRef.current.offsetHeight;
    const context = canvasRef.current.getContext("2d");

    const thumbnailCount = getThumbnailCount();
    const thumbnailWidth = canvasRef.current.width / thumbnailCount;
    const thumbnailHeight = canvasRef.current.height;

    const vid = video.current;
    let index = 0;

    function captureThumbnail() {
      if (index >= thumbnailCount) return captureEnd();

      vid.currentTime = (index / thumbnailCount) * vid.duration;

      vid.addEventListener(
        "seeked",
        function onSeeked() {
          context?.drawImage(
            vid,
            thumbnailWidth * index,
            0,
            thumbnailWidth,
            thumbnailHeight
          );
          vid.removeEventListener("seeked", onSeeked);
          index++;
          captureThumbnail();
        },
        { once: true }
      );
    }

    captureThumbnail();
  };

  const captureEnd = () => {
    if (!video?.current) {
      return;
    }
    video.current.currentTime = 0;
    setIsOn(true);
  };

  const getThumbnailCount = (): number => {
    if (!video?.current) {
      return 0;
    }

    const wrapWidth = wrapRef.current?.offsetWidth || 0;
    const wrapHeight = wrapRef.current?.offsetHeight || 0;

    const ratio = video.current.videoWidth / video.current.videoHeight;
    const width = wrapHeight * ratio;

    const availThumbs = wrapWidth / width;

    return availThumbs;
  };

  return (
    <div ref={wrapRef} className="Thumbs">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};
