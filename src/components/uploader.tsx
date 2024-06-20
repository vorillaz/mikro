import type { UnlistenFn } from "@tauri-apps/api/event";
import type { WebviewWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/api/dialog";
import { mediaFilters } from "@/utils/media";
import { useDispatcher } from "src/ctx/store";
import { addFiles } from "src/ctx/actions";
import { useEffect, useRef, useState } from "react";

import { convertFileSrc } from "@tauri-apps/api/tauri";

export const Uploader = () => {
  const [dndHover, setDndHover] = useState(false);
  const { dispatch } = useDispatcher();
  const [appWindow, setAppWindow] = useState<WebviewWindow>();
  const dropEvent = useRef<Promise<UnlistenFn> | null>(null);

  const onFilesPicked = (files: string[]) => {};

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

        addFiles(event.payload.paths).then((action) => {
          dispatch(action);
        });
      }

      if (event.payload.type === "cancel") {
        console.log("canceled");
      }
    });
    setAppWindow(appWindow);
  }

  useEffect(() => {
    setupAppWindow();
    return () => {
      dropEvent.current?.then((unlisten) => unlisten());
    };
  }, []);

  const openFiles = async () => {
    let result = await open({
      multiple: true,
      title: "Select a files ",
      filters: mediaFilters,
    });
    if (!result) {
      return;
    }
    const res = typeof result === "string" ? [result] : result;
    addFiles(res).then((action) => {
      dispatch(action);
    });
  };
  return (
    <div
      className="uploader flex w-full h-full items-center justify-center"
      data-tauri-drag-region
      onMouseOver={() => setDndHover(true)}
      onMouseOut={() => setDndHover(false)}
    >
      <div className="rounded-md border-[1px] flex w-full h-full items-center justify-center">
        <div>
          {dndHover ? "Drop files here" : "Drag files here"}
          <button onClick={openFiles}>Open files</button>
        </div>
      </div>
    </div>
  );
};
