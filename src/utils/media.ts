import { OpenDialogOptions } from "@tauri-apps/api/dialog";
import { basename, resolveResource } from "@tauri-apps/api/path";
export const FRAME_COUNT = 14;
export const imgExtensions = [
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "avif",
  "svg",
];

export const videoExtensions = [
  "flv",
  "mp4",
  "m3u8",
  "webm",
  "ogg",
  "mov",
  "avi",
  "mkv",
  "wmv",
  "m4v",
  "3gp",
  "3g2",
];

export const imgExt = /\.(png|jpe?g|gif|webp|avif|svg)$/i;
export const videoExt = /\.(mp4|webm|ogg|mov|avi|flv|mkv|wmv|m4v|3gp|3g2)$/i;

export const isNotAccepted = (file: string) => {
  return !imgExt.test(file) && !videoExt.test(file);
};

export const mediaFilters = [
  { name: "Images", extensions: imgExtensions },
  { name: "Videos", extensions: videoExtensions },
] as OpenDialogOptions["filters"];

export const fileName = async (path: string): Promise<string> => {
  const name = await basename(path);
  return name;
};

export const getFileType = async (path: string) => {
  if (imgExt.test(path)) {
    return {
      type: "image",
    };
  }
  if (videoExt.test(path)) {
    return {
      type: "video",
      trimmed: false,
      trimStart: 0,
      trimEnd: 0,
    };
  }
};

export const bytesToHuman = (bytes: number) => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Byte";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
};
