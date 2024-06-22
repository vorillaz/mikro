import { getActiveFile } from "../../ctx/selectors";
import { ImgPreview } from "./img";
import { VideoPreview } from "./video";

export const Preview = () => {
  const activeFile = getActiveFile();
  if (!activeFile) {
    return null;
  }

  const type = activeFile.type;
  return (
    <div className="min-w-[400px] flex-grow">
      {type === "image" && <ImgPreview src={activeFile?.path} />}
      {type === "video" && <VideoPreview src={activeFile?.path} />}
    </div>
  );
};
