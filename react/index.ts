export interface DataTableColumn {
    column: string;
    label: string;
    sortable: boolean;
    type: 'TextColumn' | 'ActionColumn';
}

export interface DataTableAction {
    label: string;
    name: string;
    require_confirmation: boolean;
    confirmation_text: string;
}

export interface DataTableData {
    data: DataTableRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    from: number;
    to: number;
    total: number;
}

export interface DataTableCell {
    value: string | number;
    url: { link: string } | null;
}

export type DataTableRow = {
    id: string | number;
} & Record<string, DataTableCell>;

export interface DataTableResource {
    table: string;
    columns: DataTableColumn[];
    actions: DataTableAction[];
    data: DataTableData;
    perPageOptions: number[];
    searchQuery: string;
}

export { DataTable } from "./data-table";
