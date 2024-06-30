import { useRef, useEffect } from "react";
import { addDuration } from "src/ctx/actions";
import { useDispatcher } from "src/ctx/store";
import { convertFileSrc } from "@tauri-apps/api/tauri";

import { useEventListener } from "@/hooks/use-event-listener";
import {
  getAccessToken,
  getActiveFileDuration,
  getPort,
  getActiveFile,
} from "src/ctx/selectors";
import { invoke } from "@tauri-apps/api";
import { PlayControl } from "./play-control";
import { Trimming } from "./trimming";

interface Props {
  src: string;
  file: string;
  duration: number;
}

export const VideoPreview = ({ src }: { src: string }) => {
  const token = getAccessToken();
  const port = getPort();
  const duration = getActiveFileDuration();
  const file = getActiveFile();
  const { dispatch } = useDispatcher();

  useEffect(() => {
    if (!src || !file?.id) return;

    if (duration) {
      return;
    }

    invoke<number>("get_duration", { videoPath: src })
      .then((d) => {
        dispatch(addDuration(d, file?.id));
      })
      .catch((e) => {});
    return () => {};
  }, [src, file?.id, duration]);

  let bump = `http://localhost:${port}/${src}?access_token=${token}`;

  if (!src || !file?.id || !duration) {
    return null;
  }

  return <Video src={bump} duration={duration} file={src} />;
};

export const Video = ({ src, duration, file }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!file) return;
    invoke<string>("generate_video_thumbnail", { videoPath: file }).then(
      (thumb) => {
        videoRef.current.poster = convertFileSrc(thumb);
      }
    );
  }, [file]);

  useEventListener("keydown", (e) => {
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
    }
  });

  return (
    <div
      ref={wrapperRef}
      className="video-preview flex flex-col px-8 py-4 relative w-full"
    >
      <div
        id="video-preview-wrapper"
        className="relative w-full justify-center flex-1"
      >
        {/*  */}
        <div className="video-holder relative aspect-video flex items-center justify-center flex-col">
          <video ref={videoRef} src={src} preload="metadata" muted></video>
          <PlayControl videoRef={videoRef} />

          <Trimming
            videoRef={videoRef}
            duration={duration}
            src={src}
            file={file}
          />
        </div>
      </div>
    </div>
  );
};
