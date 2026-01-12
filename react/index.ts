export interface DataTableColumn {
    column: string;
    label: string;
    type: 'TextColumn';
}

export interface DataTableAction {
    name: string;
    url: string;
    confirmable: {
        text: string;
        required: boolean;
    }
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

export type DataTableQuery = {
    page: string | null | number | undefined;
    per_page: string | null | number | undefined;
    search: string | undefined;
}

export interface DataTableResource {
    table: string;
    rows: DataTableRow[];
    columns: DataTableColumn[];
    actions: DataTableAction[];
    data: DataTableData;
    perPageOptions: number[];
    searchQuery: string;
}

export { DataTable } from "./data-table";
