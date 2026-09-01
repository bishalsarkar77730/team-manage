import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getNotesQueryFn } from "@/lib/api";

export const NOTES_PAGE_SIZE = 8;

const useNotes = ({
  workspaceId,
  keyword,
  pageNumber,
  pageSize = NOTES_PAGE_SIZE,
}: {
  workspaceId: string;
  keyword?: string | null;
  pageNumber: number;
  pageSize?: number;
}) =>
  useQuery({
    queryKey: ["notes", workspaceId, keyword, pageNumber, pageSize],
    queryFn: () =>
      getNotesQueryFn({ workspaceId, keyword, pageNumber, pageSize }),
    enabled: !!workspaceId,
    // keeps the previous page on screen while the next one loads, instead of
    // collapsing the list to a spinner on every page change
    placeholderData: keepPreviousData,
  });

export default useNotes;
