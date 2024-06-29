import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { getActiveFileDuration } from "src/ctx/selectors";
import { FRAME_COUNT } from "@/utils/media";
import { debounce } from "@/utils/helpers";
import pMap from "p-map";

export const Frames = ({
  src,
  videoRef,
}: {
  src: string;
  videoRef: React.MutableRefObject<HTMLVideoElement>;
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
    const debounced = debounce(() => {
      loadImgs();
    }, 100);

    const obs = new ResizeObserver(debounced);
    obs.observe(wrapRef.current);

    return () => {
      wrapRef?.current && obs?.unobserve(wrapRef.current);
      obs?.disconnect();
      // cleanup
      const context = canvasRef?.current?.getContext("2d");
      if (context) {
        context?.clearRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
      }
    };
  }, [src, duration, canvasRef?.current]);

  const loadImgs = async () => {
    const count = getThumbnailCount();
    const imgs = await pMap(Array.from({ length: count }), async (_, i) => {
      return await invoke<{
        path: string;
        index: number;
      }>("generate_timeline_thumbnail", {
        videoPath: src,
        index: i,
        // @ts-expect-error
        duration: parseInt(duration),
        frames: count,
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
          return s;
        }
      )
      .catch((e) => {
        console.log("Error getting frames");
        console.error(e);
        return [];
      });
    canvasRef.current.width = wrapRef.current.offsetWidth;
    canvasRef.current.height = wrapRef.current.offsetHeight;
    const context = canvasRef.current.getContext("2d");
    // clear canvas
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    for (let i = 0; i < count; i++) {
      const img = new Image();

      img.src = convertFileSrc(imgs[i]);
      img.onerror = (e) => {
        console.error(e);
      };
      img.onload = () => {
        context.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          (i * canvasRef.current.width) / count,
          0,
          canvasRef.current.width / count,
          canvasRef.current.height
        );
      };
      // release image
      URL.revokeObjectURL(img.src);
    }
  };

  const getThumbnailCount = (): number => {
    if (!videoRef?.current) {
      return 0;
    }

    const wrapWidth = wrapRef.current?.offsetWidth || 0;
    const wrapHeight = wrapRef.current?.offsetHeight || 0;

    const ratio = videoRef.current.videoWidth / videoRef.current.videoHeight;
    const width = wrapHeight * ratio;

    const availThumbs = wrapWidth / width;

    const thumbs = Math.ceil(availThumbs);

    return thumbs;
  };

  return (
    <div ref={wrapRef} className="flex w-full h-full relative">
      <canvas className="flex w-full h-full" ref={canvasRef}></canvas>
    </div>
  );
};
