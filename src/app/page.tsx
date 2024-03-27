"use client";
import React, { useState, useEffect } from "react";

import { CardButton } from "@/components/CardButton";
import { getVersion } from "@tauri-apps/api/app";
import { LOCALSTORAGE_VERSION_KEY } from "@/config/app";

export default function Page() {
  const [loading, setLoading] = useState(true);

  //   Todo permissions
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
    <div>
      <h1>Page</h1>
      <CardButton />
    </div>
  );
}
