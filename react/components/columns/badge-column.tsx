import { DataTableCell, DataTableColumn } from "../../index";
import { Link } from "@inertiajs/react";

export default function BadgeColumn({
  column,
  data,
}: {
  column: DataTableColumn;
  data: DataTableCell;
}) {
  return (
    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 inset-ring inset-ring-gray-500/10">
      {data.url ? <Link href={data.url.link}>{data.value}</Link> : data.value}
      {JSON.stringify(data, null, 2)}
    </span>
  );
}
