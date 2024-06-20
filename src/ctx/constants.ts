export enum VideoQuality {
  Highest = "Highest",
  High = "High",
  Good = "Good",
  Medium = "Medium",
  Acceptable = "Acceptable",
}

export enum VideoResolution {
  "Same" = "Same as source",
  "4k" = "4K (2160p)",
  "FullHD" = "Full HD (1080p)",
  "HD" = "HD (720p)",
}

export enum ExportVideoFormat {
  "mp4" = "mp4",
  "mov" = "mov",
  "mkv" = "mkv",
  "webm" = "webm",
  "avi" = "avi",
  "gif" = "gif",
}

export enum ImageQuality {
  Highest = "Highest",
  High = "High",
  Good = "Good",
  Medium = "Medium",
}

export enum ImageFormat {
  "png" = "png",
  "jpeg" = "jpeg",
  "webp" = "webp",
}

export const MAX_DURATION_FOR_GIF_CONVERSION = 10;
export const MAX_FPS = 60;
export const MIN_FPS = 10;
