import { ChevronLeft, ChevronRight } from 'lucide-react';

/** "Showing x to y of n" plus prev/next, for the admin tables' footer row. */
export function AdminPagination({
  page,
  pageSize,
  total,
  noun,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  noun: string;
  onPage: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(page * pageSize, total);
  const btn = 'p-1.5 rounded-lg border border-line disabled:opacity-40 hover:bg-studio-surface';

  return (
    <>
      <div>
        Showing {from} to {to} of {total.toLocaleString()} {noun}
      </div>
      <div className="flex items-center gap-2 self-center">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className={btn}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="font-semibold text-ink-soft">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className={btn}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );
}
