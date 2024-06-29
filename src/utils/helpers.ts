export const debounce = (func: Function, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>;

  return function (...args: any) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export { twMerge as cn } from "tailwind-merge";

const HOUR_IN_SECS = 3600;

export const formatTime = (seconds) => {
  const date = new Date(null);
  date.setSeconds(seconds);

  if (seconds <= HOUR_IN_SECS) {
    return date.toISOString().substr(14, 5);
  }

  return date.toISOString().substr(11, 8);
};

export const pxToPc = (px, max) => (px * 100) / max;
export const pcToPx = (pc, max) => (pc * max) / 100;
