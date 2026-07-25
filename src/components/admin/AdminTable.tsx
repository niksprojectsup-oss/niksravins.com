import { cn } from "@/lib/utils";

type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
};

type AdminTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
};

export function AdminTable<T extends { id: string }>({
  columns,
  rows,
  emptyMessage = "No records yet.",
}: AdminTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="observed-card p-8">
        <p className="type-body">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="observed-card overflow-x-auto">
      <table className="w-full min-w-[640px] text-left">
        <thead>
          <tr className="border-b border-border-subtle">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "type-caption px-5 py-4 font-medium text-ink-subtle first:pl-6 last:pr-6",
                  column.className,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border-subtle last:border-b-0"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "type-body px-5 py-4 text-ink first:pl-6 last:pr-6",
                    column.className,
                  )}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
