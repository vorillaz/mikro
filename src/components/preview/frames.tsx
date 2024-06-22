import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { getAccessToken, getPort } from "src/ctx/selectors";
import { getFrames } from "src/lib/video";

export const Frames = ({ src }: { src: string }) => {
  const [frames, setFrames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const token = getAccessToken();
  const port = getPort();
  useEffect(() => {
    if (frames.length > 0) return;
    if (!token || !port) return;
    console.log("Generating frames");
    invoke<string[]>("generate_timeline_thumbnails", {
      videoPath: src,
    }).then((res) => {
      console.log("frames done");
      setLoading(false);
      setFrames(res.map((frame) => convertFileSrc(frame)));
    });
  }, [src, port, token]);

  if (!frames.length) return null;
  return frames.map((frame) => (
    <img
      draggable={false}
      key={frame}
      src={frame}
      alt="Frame"
      className="pointer-events-none w-full max-w-[19px] select-none object-cover first-of-type:rounded-l-xl last-of-type:rounded-r-xl xs:max-w-[32px]"
    />
  ));
};
