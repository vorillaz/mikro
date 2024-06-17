import { useEffect, useRef, useState, useCallback } from "react";
import type { UnlistenFn } from "@tauri-apps/api/event";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/api/notification";
import { getFrames } from "src/lib/video";

import type { WebviewWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/tauri";
import { useGlobalShortcut } from "@/hooks/tauri/shortcuts";
import { getPort, getAccessToken } from "../ctx/selectors";

export const CardButton = ({}) => {
  const [appWindow, setAppWindow] = useState<WebviewWindow>();
  const dropEvent = useRef<Promise<UnlistenFn> | null>(null);
  const [buttonDesc, setButtonDesc] = useState<string>(
    "Waiting to be clicked. This calls 'sanity_check' from Rust."
  );

  const token = getAccessToken();
  const port = getPort();

  // Import appWindow and save it inside the state for later usage
  async function setupAppWindow() {
    const appWindow = (await import("@tauri-apps/api/window")).appWindow;
    // add drop event listener
    dropEvent.current = appWindow.onFileDropEvent((event) => {
      if (!event.payload) return;
      if (event.payload.type === "hover") {
        console.log("hovering");
      }
      if (event.payload.type === "drop") {
        console.log(event);
        console.log(event.payload.paths);
      }
    });
    setAppWindow(appWindow);
  }

  useEffect(() => {
    setupAppWindow();
    // getFrames(path, 10).then((frames) => {
    //   console.log(frames);
    // });
    return () => {
      dropEvent.current?.then((unlisten) => unlisten());
    };
  }, []);

  function windowMinimize() {
    appWindow?.minimize();
  }
  function windowToggleMaximize() {
    appWindow?.toggleMaximize();
  }

  const onButtonClick = () => {
    invoke<string>("frontend_token")
      .then((value) => {
        setButtonDesc(value);
      })
      .catch(() => {
        setButtonDesc("Failed to invoke Rust command 'sanity_check'");
      });
  };

  const shortcutHandler = useCallback(() => {
    console.log("Ctrl+P was pressed!");
  }, []);
  useGlobalShortcut("CommandOrControl+P", shortcutHandler);

  const onNot = async () => {
    console.log(":jdks");
    let permissionGranted = await isPermissionGranted();
    console.log(permissionGranted);
    if (!permissionGranted) {
      console.log("Requesting permission");
      const permission = await requestPermission();
      permissionGranted = permission === "granted";
    }
    if (permissionGranted) {
      console.log("Sending notification");
      sendNotification({ title: "TAURI", body: "Tauri is awesome!" });
    }
  };

  const getMachineId = async () => {
    invoke<string>("get_machine_id").then((value) => {
      console.log(value);
    });
  };
  const getHostname = async () => {
    invoke<string>("get_hostname").then((value) => {
      console.log(value);
    });
  };

  return (
    <div data-tauri-drag-region>
      <b>Port: {port}</b>
      <br />
      <b>Token: {token}</b>
      <br />
      <button onClick={windowMinimize}>min</button>
      <br />
      <button onClick={windowToggleMaximize}>max</button>
      <br />
      <button onClick={onButtonClick}>{buttonDesc}</button>
      <br />
      <button onClick={getMachineId}>MachineId</button>
      <br />
      <button onClick={getHostname}>Hostname</button>
      <br />
      <button onClick={onNot}>Puuuuuush</button>
    </div>
  );
};
