import { useEffect, useRef, type TouchEvent } from "react";

export type DropTarget = { columnId: number; beforeIssueId: number | null };

interface TouchDragOptions {
  enabled: boolean;
  getColumnIssueIds: (columnId: number, excludeIssueId: number) => number[];
  onStart: (issueId: number) => void;
  onTarget: (target: DropTarget | null) => void;
  onDrop: (issueId: number, target: DropTarget | null) => void;
  onEnd: () => void;
}

interface TouchDragState {
  issueId: number;
  card: HTMLElement;
  startX: number;
  startY: number;
  timer: number;
  active: boolean;
  ghost: HTMLElement | null;
  ghostOrigin: { left: number; top: number };
  target: DropTarget | null;
  cleanup: () => void;
}

const LONG_PRESS_MS = 350;
const MOVE_TOLERANCE_PX = 10;
const EDGE_SCROLL_ZONE_PX = 48;
const EDGE_SCROLL_STEP_PX = 14;
const CLICK_SUPPRESSION_MS = 400;

function scrollNearEdges(x: number, y: number) {
  const element = document.elementFromPoint(x, y);
  const list = element?.closest<HTMLElement>("[data-column-list]");
  const board = element?.closest<HTMLElement>("[data-board-scroll]");

  if (list) {
    const rect = list.getBoundingClientRect();

    if (y < rect.top + EDGE_SCROLL_ZONE_PX) list.scrollTop -= EDGE_SCROLL_STEP_PX;
    else if (y > rect.bottom - EDGE_SCROLL_ZONE_PX) {
      list.scrollTop += EDGE_SCROLL_STEP_PX;
    }
  }

  if (board) {
    const rect = board.getBoundingClientRect();

    if (x < rect.left + EDGE_SCROLL_ZONE_PX) board.scrollLeft -= EDGE_SCROLL_STEP_PX;
    else if (x > rect.right - EDGE_SCROLL_ZONE_PX) {
      board.scrollLeft += EDGE_SCROLL_STEP_PX;
    }
  }
}

/** Arrastre táctil: se activa con una pulsación larga y usa los mismos destinos que el arrastre con mouse. */
export function useTouchDrag(options: TouchDragOptions) {
  const optionsRef = useRef(options);
  const stateRef = useRef<TouchDragState | null>(null);
  const suppressClickUntil = useRef(0);

  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(
    () => () => {
      stateRef.current?.cleanup();
    },
    [],
  );

  function resolveTarget(
    x: number,
    y: number,
    issueId: number,
  ): DropTarget | null | undefined {
    const element = document.elementFromPoint(x, y);
    const columnElement = element?.closest<HTMLElement>("[data-column-id]");

    if (!element || !columnElement) return null;

    const columnId = Number(columnElement.dataset.columnId);
    const cardElement = element.closest<HTMLElement>("[data-issue-id]");

    if (!cardElement || !columnElement.contains(cardElement)) {
      return { columnId, beforeIssueId: null };
    }

    const overId = Number(cardElement.dataset.issueId);

    if (overId === issueId) return undefined;

    const ids = optionsRef.current.getColumnIssueIds(columnId, issueId);
    const rect = cardElement.getBoundingClientRect();
    const isLowerHalf = y >= rect.top + rect.height / 2;

    return {
      columnId,
      beforeIssueId: isLowerHalf
        ? (ids[ids.indexOf(overId) + 1] ?? null)
        : overId,
    };
  }

  function onTouchStart(event: TouchEvent<HTMLElement>, issueId: number) {
    if (!optionsRef.current.enabled || event.touches.length !== 1) return;

    stateRef.current?.cleanup();

    const touch = event.touches[0]!;
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();

    const handleMove = (moveEvent: globalThis.TouchEvent) => {
      const state = stateRef.current;
      const point = moveEvent.touches[0];

      if (!state || !point) return;

      if (!state.active) {
        const distance = Math.hypot(
          point.clientX - state.startX,
          point.clientY - state.startY,
        );

        if (distance > MOVE_TOLERANCE_PX) state.cleanup();

        return;
      }

      if (moveEvent.cancelable) moveEvent.preventDefault();

      if (state.ghost) {
        state.ghost.style.transform = `translate(${point.clientX - state.startX}px, ${point.clientY - state.startY}px) rotate(1.5deg)`;
      }

      scrollNearEdges(point.clientX, point.clientY);

      const target = resolveTarget(point.clientX, point.clientY, state.issueId);

      if (target !== undefined) {
        state.target = target;
        optionsRef.current.onTarget(target);
      }
    };

    const handleEnd = (endEvent: globalThis.TouchEvent) => {
      const state = stateRef.current;

      if (!state) return;

      if (state.active) {
        suppressClickUntil.current = Date.now() + CLICK_SUPPRESSION_MS;

        if (endEvent.type === "touchend") {
          optionsRef.current.onDrop(state.issueId, state.target);
        }

        optionsRef.current.onEnd();
      }

      state.cleanup();
    };

    const cleanup = () => {
      window.clearTimeout(state.timer);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
      document.removeEventListener("touchcancel", handleEnd);
      state.ghost?.remove();
      state.card.style.removeProperty("-webkit-user-select");

      if (stateRef.current === state) stateRef.current = null;
    };

    const state: TouchDragState = {
      issueId,
      card,
      startX: touch.clientX,
      startY: touch.clientY,
      active: false,
      ghost: null,
      ghostOrigin: { left: rect.left, top: rect.top },
      target: null,
      timer: window.setTimeout(() => {
        state.active = true;
        navigator.vibrate?.(12);

        const ghost = card.cloneNode(true) as HTMLElement;
        ghost.removeAttribute("data-issue-id");
        ghost.style.cssText = `position:fixed;left:${state.ghostOrigin.left}px;top:${state.ghostOrigin.top}px;width:${rect.width}px;margin:0;z-index:300;pointer-events:none;opacity:.92;transform:rotate(1.5deg);box-shadow:0 12px 32px rgba(0,0,0,.25);`;
        document.body.appendChild(ghost);
        state.ghost = ghost;

        optionsRef.current.onStart(issueId);
      }, LONG_PRESS_MS),
      cleanup,
    };

    stateRef.current = state;
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleEnd);
    document.addEventListener("touchcancel", handleEnd);
  }

  return {
    onTouchStart,
    shouldSuppressClick: () => Date.now() < suppressClickUntil.current,
  };
}
