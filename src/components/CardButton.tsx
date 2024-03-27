import { useEffect, useState, useCallback } from "react";
import { WebviewWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/tauri";
import { useGlobalShortcut } from "@/hooks/tauri/shortcuts";

export const CardButton = ({}) => {
  const [buttonDesc, setButtonDesc] = useState<string>(
    "Waiting to be clicked. This calls 'on_button_clicked' from Rust."
  );
  const [appWindow, setAppWindow] = useState<WebviewWindow>();

  // Import appWindow and save it inside the state for later usage
  async function setupAppWindow() {
    const appWindow = (await import("@tauri-apps/api/window")).appWindow;
    setAppWindow(appWindow);
  }

  useEffect(() => {
    setupAppWindow();
  }, []);

  function windowMinimize() {
    appWindow?.minimize();
  }
  function windowToggleMaximize() {
    appWindow?.toggleMaximize();
  }
  function windowClose() {
    appWindow?.close();
  }

  const onButtonClick = () => {
    invoke<string>("on_button_clicked")
      .then((value) => {
        setButtonDesc(value);
      })
      .catch(() => {
        setButtonDesc("Failed to invoke Rust command 'on_button_clicked'");
      });
  };

  const shortcutHandler = useCallback(() => {
    console.log("Ctrl+P was pressed!");
  }, []);
  useGlobalShortcut("CommandOrControl+P", shortcutHandler);

  return (
    <div data-tauri-drag-region>
      <button onClick={windowMinimize}>min</button>

      <button onClick={windowToggleMaximize}>max</button>

      <button onClick={onButtonClick}>{buttonDesc}</button>
      <button onClick={windowClose}>close</button>
    </div>
  );
};
