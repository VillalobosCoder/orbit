import {
  type ColumnDef,
  type RowData,
  flexRender,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { cn } from "cn";

import { Spinner } from "@/components/ui/spinner";

const features = tableFeatures({});

export type DataTableFeatures = typeof features;

interface DataTableProps<TData extends RowData> {
  data: TData[];
  columns: ColumnDef<DataTableFeatures, TData, unknown>[];
  isLoading?: boolean;
  emptyMessage?: string;
  minRows?: number;
}

const ROW_HEIGHT_REM = 4;

export function TableComponent<TData extends RowData>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "Sin registros",
  minRows,
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    data,
    columns,
  });
  const rows = table.getRowModel().rows;
  const showPlaceholder = isLoading || rows.length === 0;
  const rowHeight = minRows ? "h-16" : undefined;
  const fillerCount = minRows ? Math.max(0, minRows - rows.length) : 0;

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-muted/60">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="h-11 px-5 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {showPlaceholder ? (
            <tr
              className="border-t border-border"
              style={
                minRows
                  ? { height: `${minRows * ROW_HEIGHT_REM}rem` }
                  : undefined
              }
            >
              <td
                colSpan={columns.length}
                className="px-5 py-10 text-center text-muted-foreground"
              >
                {isLoading ? (
                  <Spinner aria-label="Cargando" className="mx-auto size-6" />
                ) : (
                  emptyMessage
                )}
              </td>
            </tr>
          ) : (
            <>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-t border-border transition-colors hover:bg-accent/50",
                    rowHeight,
                  )}
                >
                  {row.getAllCells().map((cell) => (
                    <td key={cell.id} className="px-5 py-3 whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {Array.from({ length: fillerCount }, (_, index) => (
                <tr
                  key={`filler-${index}`}
                  aria-hidden="true"
                  className={cn("border-t border-border", rowHeight)}
                >
                  <td colSpan={columns.length} />
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
