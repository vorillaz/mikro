import { invoke } from "@tauri-apps/api";

export interface fsStat {
  // Timestamp of last modification (UNIX epoch time, in milliseconds, just how JS likes it)
  mtime: number;
  /* Is this a directory. */
  isDir: boolean;
  /* Is this a regular file. */
  isFile: boolean;
  /* File size in bytes. */
  size: number;
}

export function fileStat(filename: string): Promise<fsStat> {
  return invoke("filestat", { filename }).then((x) => {
    return JSON.parse(x as string) as fsStat;
  });
}

export function fileSize(filename: string): Promise<number> {
  return fileStat(filename).then((x) => x.size);
}
