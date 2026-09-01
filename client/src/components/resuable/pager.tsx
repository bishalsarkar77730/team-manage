import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PaginationType } from "@/types/api.type";

/**
 * Server-side pagination control. Deliberately shows the range rather than a
 * page-number strip: the API returns totalCount, so "9-16 of 41" is more
 * informative than a row of numbers and does not grow with the dataset.
 */
const Pager = ({
  pagination,
  onPageChange,
  isLoading,
}: {
  pagination?: PaginationType;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}) => {
  if (!pagination || pagination.totalCount === 0) return null;

  const { pageNumber, pageSize, totalCount, totalPages } = pagination;
  const first = (pageNumber - 1) * pageSize + 1;
  const last = Math.min(pageNumber * pageSize, totalCount);

  return (
    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground sm:text-sm">
        Showing {first}&ndash;{last} of {totalCount}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          disabled={isLoading || pageNumber <= 1}
          onClick={() => onPageChange(pageNumber - 1)}
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        <span className="whitespace-nowrap text-xs text-muted-foreground sm:text-sm">
          Page {pageNumber} of {Math.max(totalPages, 1)}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          disabled={isLoading || pageNumber >= totalPages}
          onClick={() => onPageChange(pageNumber + 1)}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pager;
