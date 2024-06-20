import { useContextSelector } from "use-context-selector";
import { Context } from "./store";

export const getSanityCount = () => {
  return useContextSelector(Context, ({ state }) => state?.sanity_count);
};

export const getMachineId = () => {
  return useContextSelector(Context, ({ state }) => state?.machineId);
};

export const getHostname = () => {
  return useContextSelector(Context, ({ state }) => state?.hostname);
};

export const getActiveFileId = () => {
  return useContextSelector(Context, ({ state }) => {
    const active = state?.filesToConvert?.find((file) => file.view);
    return active?.id || null;
  });
};

export const getFiles = () => {
  return useContextSelector(Context, ({ state }) => state?.filesToConvert);
};

export const getPort = () => {
  return useContextSelector(Context, ({ state }) => state?.port);
};

export const getAccessToken = () => {
  return useContextSelector(Context, ({ state }) => state?.access_token);
};
