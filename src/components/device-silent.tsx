import { useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { useDispatcher } from "../ctx/store";
import {
  addMachineId,
  addHostname,
  addPort,
  addAccessToken,
} from "../ctx/actions";

export const DeviceSilent = () => {
  const { dispatch } = useDispatcher();
  useEffect(() => {
    invoke<string>("get_machine_id").then((value) => {
      dispatch(addMachineId(value));
    });
    invoke<string>("frontend_port").then((value) => {
      dispatch(addPort(parseInt(value)));
    });
    invoke<string>("frontend_token").then((value) => {
      dispatch(addAccessToken(value));
    });
    invoke<string>("get_hostname").then((value) => {
      dispatch(addHostname(value));
    });
  }, []);
  return null;
};
