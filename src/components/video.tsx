import { useEffect, useRef } from "react";
import { useState } from "react";
import { getAccessToken, getPort } from "src/ctx/selectors";
import { invoke } from "@tauri-apps/api/tauri";
import ReactPlayer from "react-player";
import { convertFileSrc } from "@tauri-apps/api/tauri";

export const Video = () => {
  const videoRef: any = useRef(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [thumbnail, setThumbnail] = useState<string>("");
  const token = getAccessToken();
  const port = getPort();

  useEffect(() => {
    if (!port || !token) return;

    invoke<string>("generate_video_thumbnail", {
      videoPath:
        "/Users/theodorevorillas/Desktop/demo-media/file_example_AVI_480_750kB.avi",
    }).then((res) => {
      console.log("thumbnail", res);
      console.log(res);
      setThumbnail(res);
    });
    invoke<string>("get_duration", {
      videoPath:
        "/Users/theodorevorillas/Desktop/demo-media/305719289-d6edd139-391d-4ba8-922d-a501d454c62e 1.mov",
    }).then((res) => {
      console.log("duration", res);
      console.log(res);
    });
    invoke<string>("generate_timeline_thumbnails", {
      videoPath:
        "/Users/theodorevorillas/Desktop/demo-media/file_example_MP4_480_1_5MG 1.mp4",
    }).then((res) => {
      console.log("thumbs", res);
      console.log(res);
    });

    fetch(
      `http://localhost:${port}//Users/theodorevorillas/Desktop/demo-media/305719289-d6edd139-391d-4ba8-922d-a501d454c62e 1.mov?access_token=${token}`,
      {
        method: "GET",
        headers: {
          range: "bytes=0-",
        },
      }
    )
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      });
  }, [port, token]);
  return (
    <div>
      <img src={convertFileSrc(thumbnail)} />
      <ReactPlayer
        controls={true}
        stopOnUnmount={true}
        ref={videoRef}
        onReady={() => videoRef.current?.seekTo(10)}
        onError={(error) => console.error("error", error)}
        url={[
          `http://localhost:${port}//Users/theodorevorillas/Desktop/demo-media/file_example_WMV_480_1_2MB.mp4?access_token=${token}`,
        ]}
      />
      {/* <RcDPlayer
        src="stream://localhost//Users/theodorevorillas/Desktop/demo-media/sample_1280x720_surfing_with_audio.flv"
        mseType={MseType.flv}
        onLoad={(dp) => {
          console.log("DPlayer instance", dp);
        }}
        onError={(event) => {
          console.error("error", event);
        }}
      /> */}
      {/* <RcDPlayer 
      <video controls className="img" muted>
        <source src={videoUrl} type="video/quicktime" />
      </video>
      */}
    </div>
  );
};
