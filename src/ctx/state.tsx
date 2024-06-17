export type fileType = "video" | "image";
export type passedFile = {
  path: string;
  size: number;
  name: number;
};
export type mikroFile = {
  path: string;
  name: string;
  type: fileType;
  id: string;
  fileSize: number; // in bytes
  videoDuration?: number; // in seconds
  trimmed?: boolean;
  trimStart?: number; // in ms
  trimEnd?: number;
};

export type MikroState = {
  theme: "light" | "dark" | "system";
  purchased: boolean;
  availableConversions: number;
  machineId?: string | null;
  hostname?: string | null;
  sanity_count: number;
  // Fetch
  port: number;
  access_token: string;
  //   Converting data
  filesToConvert: mikroFile[];
  conversionInProgress: boolean;
};

export const initialState = {
  theme: "light", // theme of the user
  purchased: false, // is there a valid licence
  availableConversions: 3, // number of available free conversions
  machineId: null,
  sanity_count: 1,
  filesToConvert: [],
  //   converting data
} as MikroState;
