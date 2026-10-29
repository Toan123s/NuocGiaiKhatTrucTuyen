"use client";
// TV3 — Hook đọc phiên đăng nhập hiện tại, tự cập nhật khi đăng nhập/đăng xuất (kể cả ở tab khác).
// Lần render đầu (SSR và hydrate) luôn là null để HTML khớp; sau đó React đọc localStorage.
import { useMemo, useSyncExternalStore } from "react";
import {
  parseSession,
  readRawSession,
  SESSION_CHANGED_EVENT,
  type StoredSession,
} from "./session";
function subscribe(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(SESSION_CHANGED_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(SESSION_CHANGED_EVENT, onChange);
  };
}
function getServerSnapshot(): string | null {
  return null;
}
export function useSession(): StoredSession | null {
  // Snapshot là chuỗi thô (so sánh theo giá trị) nên không gây render lặp.
  const raw = useSyncExternalStore(subscribe, readRawSession, getServerSnapshot);
  return useMemo(() => parseSession(raw), [raw]);
}
