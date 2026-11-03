export type MediaMetadata = {
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
};

const READ_TIMEOUT_MS = 5000;
const EMPTY: MediaMetadata = { width: null, height: null, durationSeconds: null };

export function readMediaMetadata(file: File): Promise<MediaMetadata> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const isVideo = file.type.startsWith("video/");
    const element = isVideo ? document.createElement("video") : new Image();
    const timer = window.setTimeout(() => finish(EMPTY), READ_TIMEOUT_MS);

    function finish(metadata: MediaMetadata) {
      window.clearTimeout(timer);
      URL.revokeObjectURL(url);
      resolve(metadata);
    }

    if (element instanceof HTMLVideoElement) {
      element.preload = "metadata";
      element.onloadedmetadata = () =>
        finish({
          width: element.videoWidth || null,
          height: element.videoHeight || null,
          durationSeconds: Number.isFinite(element.duration)
            ? Math.round(element.duration)
            : null,
        });
      element.onerror = () => finish(EMPTY);
    } else {
      element.onload = () =>
        finish({
          width: element.naturalWidth || null,
          height: element.naturalHeight || null,
          durationSeconds: null,
        });
      element.onerror = () => finish(EMPTY);
    }

    element.src = url;
  });
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${minutes}:${seconds}`;
}
