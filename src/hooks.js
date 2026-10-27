import { useEffect, useRef } from 'react';
import { API_BASE, getToken } from './api.js';

// One shared EventSource for the whole app; components subscribe via useLive.
const listeners = new Set();
let source = null;

function open() {
  const token = getToken();
  if (!token || source) return;
  source = new EventSource(`${API_BASE}/events/stream?token=${encodeURIComponent(token)}`);
  const fire = (e) => listeners.forEach((fn) => fn(e.type, JSON.parse(e.data)));
  source.addEventListener('ticket.created', fire);
  source.addEventListener('ticket.updated', fire);
}
const close = () => { source?.close(); source = null; };

/** Calls handler(type, payload) on server pushes, plus a slow 45s poll as a safety net if SSE is blocked. */
export function useLive(handler) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    const fn = (type, payload) => ref.current(type, payload);
    listeners.add(fn);
    open();
    const poll = setInterval(() => ref.current('poll', {}), 45000);
    return () => { listeners.delete(fn); clearInterval(poll); if (!listeners.size) close(); };
  }, []);
}
