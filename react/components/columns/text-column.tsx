import { DataTableCell, DataTableColumn } from '../../index';
import { Link } from '@inertiajs/react';

export default function TextColumn({ column, data }: { column: DataTableColumn, data: DataTableCell }) {
    return (
        <span>
            {data.url ? (<Link href={data.url.link}>{data.value}</Link>) : (data.value)}
        </span>
    )
}