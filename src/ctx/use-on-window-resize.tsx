import { useEffect, useState } from "react";
import { debounce } from "@/utils/helpers";

export const useOnWindowResize = (callback: () => void) => {
  const debounced = debounce(callback, 100);
  useEffect(() => {
    window.addEventListener("resize", debounced);
    return () => {
      window.removeEventListener("resize", debounced);
    };
  }, [callback]);
};
