import {
  type ColumnDef,
  type RowData,
  flexRender,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";

import { Skeleton } from "@/components/ui/skeleton";

const features = tableFeatures({});

export type DataTableFeatures = typeof features;

interface DataTableProps<TData extends RowData> {
  data: TData[];
  columns: ColumnDef<DataTableFeatures, TData, any>[];
  isLoading?: boolean;
  emptyMessage?: string;
}

const SKELETON_ROWS = 5;

export function TableComponent<TData extends RowData>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "No hay resultados.",
}: DataTableProps<TData>) {
  const table = useTable({
    features,
    data,
    columns,
  });

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
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <tr key={index} className="border-t border-border">
                {columns.map((_column, columnIndex) => (
                  <td key={columnIndex} className="px-5 py-4">
                    <Skeleton className="h-4 w-3/4" />
                  </td>
                ))}
              </tr>
            ))
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-border transition-colors hover:bg-accent/50"
              >
                {row.getAllCells().map((cell) => (
                  <td key={cell.id} className="px-5 py-3 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr className="border-t border-border">
              <td
                colSpan={columns.length}
                className="px-5 py-10 text-center text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
