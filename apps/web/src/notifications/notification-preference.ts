import { useSyncExternalStore } from "react";

const STORAGE_KEY = "orbit-success-toasts";

function readInitial() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

let showSuccessToasts = readInitial();
const listeners = new Set<() => void>();

export function getSuccessToastsEnabled() {
  return showSuccessToasts;
}

export function setSuccessToastsEnabled(enabled: boolean) {
  if (enabled === showSuccessToasts) return;

  showSuccessToasts = enabled;

  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // La preferencia solo vive en memoria si el almacenamiento falla.
  }

  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function useSuccessToastsEnabled() {
  return useSyncExternalStore(
    subscribe,
    getSuccessToastsEnabled,
    getSuccessToastsEnabled,
  );
}
