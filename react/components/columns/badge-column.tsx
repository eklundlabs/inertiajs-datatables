import { DataTableCell, DataTableColumn } from "../../index";
import { Link } from "@inertiajs/react";
import { useDataTableContext } from '../../data-table'

export default function BadgeColumn({
  column,
  data,
}: {
  column: DataTableColumn;
  data: DataTableCell;
}) {
  const { iconResolver } = useDataTableContext();
  const Icon = iconResolver?.(data.icon?.name ?? "");

  const content = data.url ? (
    <Link href={data.url.link}>{data.value}</Link>
  ) : (
    data.value
  );

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 inset-ring inset-ring-gray-500/10">
      {Icon && <Icon className="h-4 w-4" />}
      {content}
    </span>
  );
}
