import { convertFileSrc } from "@tauri-apps/api/tauri";

export const ImgPreview = ({ src }: { src: string }) => {
  return (
    <div className="img-preview w-full h-full flex">
      <div className="custom-scroll quick-preview-images-scroll flex size-full justify-center transition-all">
        <img
          className="w-full h-full object-contain"
          src={convertFileSrc(src)}
          alt="preview"
        />
      </div>
    </div>
  );
};
