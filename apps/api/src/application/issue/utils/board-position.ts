const POSITION_STEP = 1024;


export function computeBoardPosition(
  previous: number | null,
  next: number | null,
): number {
  if (previous !== null && next !== null) {
    return (previous + next) / 2;
  }

  if (previous !== null) {
    return previous + POSITION_STEP;
  }

  if (next !== null) {
    return next - POSITION_STEP;
  }

  return 0;
}

export function positionAfter(last: number | null): number {
  return computeBoardPosition(last, null);
}
