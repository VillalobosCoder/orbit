import { useSyncExternalStore } from "react"

const COARSE_POINTER_QUERY = "(pointer: coarse)"

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(COARSE_POINTER_QUERY)
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

function getSnapshot() {
  return window.matchMedia(COARSE_POINTER_QUERY).matches
}

/** Verdadero cuando el puntero principal es táctil, donde el arrastre nativo no funciona. */
export function useCoarsePointer() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
