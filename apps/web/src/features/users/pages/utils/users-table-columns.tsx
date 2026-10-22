import { Button } from "@/components/ui/button";
import type { DataTableFeatures } from "@/shared/ui/custom-components/table-component";
import type { UserDto } from "@orbit/shared";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<DataTableFeatures, UserDto>();

export const columns = columnHelper.columns([
  columnHelper.accessor("name", { header: "Nombre" }),
  columnHelper.accessor("lastName", { header: "Apellido" }),
  columnHelper.accessor("email", { header: "Correo electrónico" }),
  columnHelper.display({
    id: "actions",
    header: "Acciones",
    cell: () => {
      return (<Button onClick={() => console.log("prueba")}>Test</Button>)
    }
  }),
]);
