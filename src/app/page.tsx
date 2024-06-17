"use client";
import React, { useState, useEffect } from "react";
import { Uploader } from "@/components/uploader";
import { CardButton } from "@/components/CardButton";
import { Video } from "@/components/video";
import { getVersion } from "@tauri-apps/api/app";
import { Sanity } from "@/components/sanity";
import { Files } from "@/components/files";
import { DeviceSilent } from "@/components/device-silent";
import { LOCALSTORAGE_VERSION_KEY } from "@/config/app";

export default function Page() {
  const [loading, setLoading] = useState(true);

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
    <>
      <DeviceSilent />
      <div className="flex-grow">
        <Uploader />
      </div>
      <div className="w-80 max-w-80">
        <Video />
        <div>controls</div>
        <hr />
        <Files />
        <hr />
        <CardButton />
        <hr />
        <Sanity />
      </div>
    </>
  );
}
