"use client";
import React, { useEffect } from "react";
import { Preview } from "@/components/preview";
import { FileExplorer } from "@/components/file-explorer";
import { hasFiles } from "src/ctx/selectors";
import { Uploader } from "@/components/uploader";
import { getVersion } from "@tauri-apps/api/app";
import { DeviceSilent } from "@/components/device-silent";
import { LOCALSTORAGE_VERSION_KEY } from "@/config/app";

export default function Page() {
  const hasAnyFiles = hasFiles();

  useEffect(() => {
    const checkVersion = async () => {
      const storedVersion = localStorage.getItem(LOCALSTORAGE_VERSION_KEY);
      const appVersion = await getVersion();
      if (!storedVersion) {
        console.log("No version stored");
        localStorage.setItem(LOCALSTORAGE_VERSION_KEY, appVersion);
      }
    };
    checkVersion();
  }, []);

  return (
    <div className="flex h-full w-full">
      <DeviceSilent />
      {!hasAnyFiles && (
        <div className="flex-grow">
          <Uploader />
        </div>
      )}
      {hasAnyFiles && (
        <div className="flex-grow flex gap-5">
          <Preview />
          <div className="w-80 max-w-80">
            <FileExplorer />
          </div>
        </div>
      )}
    </div>
  );
}
