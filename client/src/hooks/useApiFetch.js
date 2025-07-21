import { useContext } from "react";
import { NetworkStatusContext } from "../contexts/NetworkStatusContext";
import { apiFetch } from "../utils/apiFetch";

export function useApiFetch() {
  const isOnline = useContext(NetworkStatusContext);

  return (options) => apiFetch({ ...options, isOnline });
}