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

export const lerp = (start: number, end: number, amt: number) =>
  (1 - amt) * start + amt * end;

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const formatTime = (seconds: number) => {
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const milliseconds = Math.floor((seconds - Math.floor(seconds)) * 100);

  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}:${String(milliseconds).padStart(2, "0")}`;
};
