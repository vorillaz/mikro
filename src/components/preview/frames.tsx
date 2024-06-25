import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { getActiveFileDuration, getActiveFile } from "src/ctx/selectors";
import { FRAME_COUNT } from "@/utils/media";
import pMap from "p-map";

export const getFrame = (src?: string | null | undefined) => {
  if (!src) {
    // base64 empty image
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  }

  return convertFileSrc(src);
};

export const Frames = ({
  src,
  video,
}: {
  src: string;
  video: React.MutableRefObject<HTMLVideoElement>;
}) => {
  const [frames, setFrames] = useState<string[]>(
    // empty array of 20 frames
    Array.from({ length: FRAME_COUNT }, (_, i) => null)
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const duration = getActiveFileDuration();

  useEffect(() => {
    if (!duration) return;
    // Loop and get frames with promise all
    pMap(Array.from({ length: FRAME_COUNT }), async (_, i) => {
      return await invoke<{
        path: string;
        index: number;
      }>("generate_timeline_thumbnail", {
        videoPath: src,
        index: i,
        // @ts-expect-error
        duration: parseInt(duration),
        frames: FRAME_COUNT,
      });
    })
      .then(
        (
          frames: [
            {
              path: string;
              index: number;
            }
          ]
        ) => {
          const s = frames.sort((a, b) => a.index - b.index).map((f) => f.path);
          setFrames(() => [...s]);
          handleInit();
        }
      )
      .catch((e) => {
        console.log("Error getting frames");
        console.error(e);
      });
  }, [src, duration, canvasRef?.current]);

  const handleInit = () => {
    canvasRef.current.width = wrapRef.current.offsetWidth;
    canvasRef.current.height = wrapRef.current.offsetHeight;
    const context = canvasRef.current.getContext("2d");
    const thumbnailCount = getThumbnailCount();

    const thumbnailWidth = canvasRef.current.width / thumbnailCount;
    const thumbnailHeight = canvasRef.current.height;

    const vid = video.current;
    console.log(thumbnailCount);
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
    <div ref={wrapRef} className="flex w-full">
      <canvas className="flex w-full" ref={canvasRef}></canvas>
    </div>
  );
};
