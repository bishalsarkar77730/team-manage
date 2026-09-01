import { useEffect } from "react";
import { sendHeartbeatFn } from "@/lib/api";

/** How often a visible tab reports in. */
const HEARTBEAT_MS = 60 * 1000;

/**
 * Never send two heartbeats closer together than this. Switching tabs quickly
 * would otherwise fire one per switch; the server throttles its writes anyway,
 * but there is no reason to spend the requests.
 */
const MIN_GAP_MS = 30 * 1000;

/**
 * Keeps the signed-in user counted as active while their tab is visible.
 *
 * Ordinary app requests already refresh presence server-side, so this only has
 * to cover the case of a tab sitting open with nothing being fetched. It stops
 * completely when the tab is hidden — a backgrounded tab is not an active user,
 * and stopping is what keeps this from being a wasted request every minute on
 * every tab anyone ever left open.
 */
const usePresenceHeartbeat = (enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;

    let timer: number | undefined;
    let lastBeatAt = 0;

    const beat = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastBeatAt < MIN_GAP_MS) return;

      lastBeatAt = Date.now();
      // telemetry: a failed heartbeat must never surface to the user
      sendHeartbeatFn().catch(() => {});
    };

    const stop = () => {
      if (timer !== undefined) window.clearInterval(timer);
      timer = undefined;
    };

    const start = () => {
      stop();
      beat();
      timer = window.setInterval(beat, HEARTBEAT_MS);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };

    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stop();
    };
  }, [enabled]);
};

export default usePresenceHeartbeat;
