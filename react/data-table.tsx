import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Link, router } from '@inertiajs/react';
import { useDebounce } from '@uidotdev/usehooks';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';
import React, { useEffect, useMemo, useState, useLayoutEffect } from 'react';
import { DataTableAction, DataTableCell, DataTableQuery, DataTableResource, DataTableRow } from './index';

export function useDataTable(resource: DataTableResource) {
    const [search, setSearch] = useState<string>(resource.searchQuery ?? '');
    const [perPage, _setPerPage] = useState<string | number>(resource.data.per_page);

    const isFirstPage = resource.data.current_page === 1;
    const isLastPage = resource.data.current_page === resource.data.last_page;

    const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const URLParams = new URLSearchParams(window.location.search);

    const [query, setQuery] = useState<DataTableQuery>({
        page: URLParams.get('page') ?? undefined,
        per_page: URLParams.get('per_page') ?? undefined,
        search_query: resource.searchQuery ?? undefined,
    });

    const allRowsAreSelected = useMemo(() => {
        const allRowIds = resource.rows.map((row) => row.id);
        return (
            allRowIds.length > 0 &&
            allRowIds.every((id) => selectedKeys.includes(id))
        );
    }, [selectedKeys]);

    const setPerPage = (per_page: number | string) => {
        _setPerPage(per_page);

        setQuery(q => ({
            ...q,
            per_page: per_page,
            page: 1,
        }));
    }

    const selectRow = (row: DataTableRow) => { setSelectedKeys([...selectedKeys, row.id]) };

    const deselectRow = (row: DataTableRow) => { setSelectedKeys(selectedKeys.filter((key: string|number) => key !== row.id)) };

    const updateTable = () => {
        setIsLoading(true);

        router.get(
            window.location.pathname,
            query,
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => {
                    setIsLoading(false);
                },
            },
        );
    };

    useEffect(() => {
        updateTable()
    }, [query]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setQuery(q => ({
                ...q,
                search_query: search || undefined,
                page: 1,
            }));
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    return {
        state: {
            isFirstPage,
            isLastPage,
            isLoading,
            selectedKeys,
            allRowsAreSelected,
            search,
            perPage,
        },

        setPerPage,
        setSearch,
        selectRow,
        deselectRow,
        setSelectedKeys,
        setIsLoading,
    }
}

export function DataTable({ resource }: { resource: DataTableResource }) {
    const table = useDataTable(resource);

    const handleAction = (action: DataTableAction) => {
        const confirmation = action.require_confirmation
            ? confirm(action.confirmation_text)
            : true;

        if (!confirmation) {
            return;
        }

        router.post(
            `/data-tables/${resource.table}/action/${action.name}`,
            {
                keys: table.state.selectedKeys,
            },
            {
                onSuccess: () => {
                    table.setSelectedKeys([]);
                },
            },
        );
    };

    const toggleSelectAll = (checked: string | boolean) => {
        checked ? table.setSelectedKeys(
            resource.data.data.map((row) => row.id)
        ) : table.setSelectedKeys([]);
    };

    return (
        <div className="relative">
            {table.state.isLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-100/30"></div>
            )}

            <div className="mb-4 flex">
                <Input
                    className="max-w-sm"
                    type="search"
                    placeholder="Search"
                    value={table.state.search}
                    onChange={(e) => table.setSearch(e.target.value)}
                />
                {resource.actions.length > 0 && (
                    <div className="ml-auto">
                        {resource.actions.map((action, index) => {
                            return (
                                <Button
                                    disabled={table.state.selectedKeys.length < 1}
                                    onClick={() => handleAction(action)}
                                    key={index}
                                    size="sm"
                                    variant="outline"
                                >
                                    {action.label}
                                </Button>
                            );
                        })}
                    </div>
                )}
            </div>
            <table className="id-table">
                <thead className="id-thead">
                    <tr className="id-tr">
                        <th className="id-th">
                            <input
                                type="checkbox"
                                checked={table.state.allRowsAreSelected}
                                onChange={(e) => toggleSelectAll(e.target.checked)}
                            />
                        </th>

                        {resource.columns.map((column, index) => {
                            return (
                                <th key={index} className="inertia-datatable-th">
                                    {column.label}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody className="id-tbody">
                    {resource.data.data.length === 0 ? (
                        <tr className="id-tr">
                            <td
                                colSpan={resource.columns.length + 1}
                                className="id-td"
                            >
                                <p className="id-no-results">
                                    No results found
                                </p>
                            </td>
                        </tr>
                    ) : (
                        resource.data.data.map((row, index) => (
                            <tr className="id-tr" key={index}>
                                <td className="id-td">
                                    <input
                                        type="checkbox"
                                        checked={table.state.selectedKeys.includes(row.id)}
                                        onChange={(e) => e.target.checked ?
                                            table.selectRow(row) :
                                            table.deselectRow(row)
                                        }
                                    />
                                </td>

                                {resource.columns.map((column) => {
                                    const _column = row[column.column];

                                    return (
                                        <td className="id-td" key={column.column}>
                                            {_column.url ? (
                                                <Link href={_column.url.link}>{_column.value}</Link>
                                            ) : (
                                                _column.value
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <div className="mt-4 items-center justify-between md:flex">
                <div className="flex flex-1">
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                            Showing {resource.data.from} - {resource.data.to} of{' '}
                            {resource.data.total} results
                        </div>
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Rows per page:
                        </span>
                        <select
                            value={table.state.perPage}
                            onChange={(e) => table.setPerPage(e.target.value)}
                        >
                            {resource.perPageOptions.map((perPageOption) => (
                                <option key={perPageOption}>{perPageOption}</option>
                            ))}

                            {/*<SelectTrigger className="w-[70px]">*/}
                            {/*    <SelectValue />*/}
                            {/*</SelectTrigger>*/}
                            {/*<SelectContent>*/}
                            {/*    {resource.perPageOptions.map(*/}
                            {/*        (perPageOption) => (*/}
                            {/*            <SelectItem*/}
                            {/*                key={perPageOption}*/}
                            {/*                value={perPageOption.toString()}*/}
                            {/*            >*/}
                            {/*                {perPageOption}*/}
                            {/*            </SelectItem>*/}
                            {/*        ),*/}
                            {/*    )}*/}
                            {/*</SelectContent>*/}
                        </select>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 md:mt-0 md:ml-8">
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={table.state.isFirstPage}
                        onClick={() => updateTable({ page: 1 })}
                        title="First page"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        disabled={table.state.isFirstPage}
                        onClick={() =>
                            updateTable({
                                page: resource.data.current_page - 1,
                            })
                        }
                        title="Previous page"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="px-2 text-sm text-muted-foreground">
                        Page {resource.data.current_page} of{' '}
                        {resource.data.last_page}
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        disabled={table.state.isLastPage}
                        onClick={() =>
                            updateTable({
                                page: resource.data.current_page + 1,
                            })
                        }
                        title="Next page"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        disabled={table.state.isLastPage}
                        onClick={() =>
                            updateTable({ page: resource.data.last_page })
                        }
                        title="Last page"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
