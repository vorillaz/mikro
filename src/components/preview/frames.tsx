import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { getActiveFileDuration, getActiveFile } from "src/ctx/selectors";
import { FRAME_COUNT } from "@/utils/media";
import pMap from "p-map";

export const Frames = ({
  src,
  video,
  wrapper,
}: {
  src: string;
  video: React.MutableRefObject<HTMLVideoElement>;
  wrapper: React.MutableRefObject<HTMLDivElement>;
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
          loadImgs([...s]);
          setFrames(() => [...s]);
        }
      )
      .catch((e) => {
        console.log("Error getting frames");
        console.error(e);
      });
  }, [src, duration, canvasRef?.current]);

  const loadImgs = (frameUrls: string[]) => {
    canvasRef.current.width = wrapRef.current.offsetWidth;
    canvasRef.current.height = wrapRef.current.offsetHeight;
    const context = canvasRef.current.getContext("2d");
    // clear canvas
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    const count = getThumbnailCount();
    for (let i = 0; i < frameUrls.length; i++) {
      const img = new Image();

      img.src = convertFileSrc(frameUrls[i]);
      img.onload = () => {
        console.log("loaded");
        context.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          (i * canvasRef.current.width) / frames.length,
          0,
          canvasRef.current.width / frames.length,
          canvasRef.current.height
        );
      };
    }
  };

  const handleInit = (frameUrls: string[]) => {
    canvasRef.current.width = wrapRef.current.offsetWidth;
    canvasRef.current.height = wrapRef.current.offsetHeight;
    const context = canvasRef.current.getContext("2d");
    const count = getThumbnailCount();
    for (let i = 0; i < frameUrls.length; i++) {
      const img = new Image();

      img.src = convertFileSrc(frameUrls[i]);
      img.onload = () => {
        console.log("loaded");
        context.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          (i * canvasRef.current.width) / frames.length,
          0,
          canvasRef.current.width / frames.length,
          canvasRef.current.height
        );
      };
    }
  };

  const getThumbnailCount = (): number => {
    if (!video?.current) {
      return 0;
    }

    const wrapWidth = wrapper.current?.offsetWidth || 0;
    const wrapHeight = wrapper.current?.offsetHeight || 0;

    const ratio = video.current.videoWidth / video.current.videoHeight;
    const width = wrapHeight * ratio;

    console.log(ratio);

    const availThumbs = wrapWidth / width;

    return availThumbs;
  };

  return (
    <div ref={wrapRef} className="flex w-full">
      <canvas className="flex w-full" ref={canvasRef}></canvas>
    </div>
  );
};
