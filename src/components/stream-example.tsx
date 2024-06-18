import { useEffect, useRef } from "react";
import { getAccessToken, getPort } from "src/ctx/selectors";
import { invoke } from "@tauri-apps/api/tauri";
export const Stream = () => {
  const videoRef: any = useRef(null);
  const token = getAccessToken();
  const port = getPort();
  const mediaSource = new MediaSource();
  const path = `http://localhost:${port}//Users/theodorevorillas/Desktop/demo-media/BigBuckBunny.mp4?access_token=${token}`;

  const onRemove = () => {};

  return (
    <div>
      <b>Streaming video</b>
      <br />
      <video preload="metadata" ref={videoRef} controls></video>
    </div>
  );
};
