import { getWorkspacePresenceQueryFn } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

/**
 * How often the client asks who is online. Deliberately its own query rather
 * than part of the member listing, so names and roles can stay cached forever
 * while only this small payload is refetched.
 */
export const PRESENCE_POLL_MS = 30 * 1000;

const useWorkspacePresence = (workspaceId: string) => {
  return useQuery({
    queryKey: ["presence", workspaceId],
    queryFn: () => getWorkspacePresenceQueryFn(workspaceId),
    enabled: !!workspaceId,
    refetchInterval: PRESENCE_POLL_MS,
    // false is the react-query default, but state it: an unfocused tab must
    // stop polling entirely rather than keep a timer running in the background
    refetchIntervalInBackground: false,
    staleTime: PRESENCE_POLL_MS,
    // presence is disposable — a failed poll should retry on the next tick
    // rather than burn retries
    retry: false,
  });
};

export default useWorkspacePresence;
