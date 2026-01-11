import { Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { DataTableAction, DataTableCell, DataTableQuery, DataTableResource, DataTableRow } from './index';

export function useDataTable(resource: DataTableResource) {
    const [search, _setSearch] = useState<string>(resource.searchQuery ?? '');
    const [searchTimeoutTimer, setSearchTimeoutTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

    const [perPage, _setPerPage] = useState<string | number>(resource.data.per_page);

    const isFirstPage = resource.data.current_page === 1;
    const isLastPage = resource.data.current_page === resource.data.last_page;

    const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const URLParams = new URLSearchParams(window.location.search);

    const [query, _setQuery] = useState<DataTableQuery>({
        page: URLParams.get('page') ?? undefined,
        per_page: URLParams.get('per_page') ?? undefined,
        search_query: URLParams.get('search_query') ?? undefined,
    });

    const setQuery = (query: {[key: string]: number | string | undefined}) => {
        _setQuery(q => ({
            ...q,
            ...query
        }));
    }

    const allRowsAreSelected = useMemo(() => {
        const allRowIds = resource.rows.map((row) => row.id);
        return (
            allRowIds.length > 0 &&
            allRowIds.every((id) => selectedKeys.includes(id))
        );
    }, [selectedKeys]);

    const setPerPage = (per_page: number | string) => {
        _setPerPage(per_page);

        setQuery({
            per_page: per_page,
            page: 1,
        });
    }

    const setPage = (page: number | string) => {
        setQuery({page});
    }

    const setSearch = (query: string) => {
        if (searchTimeoutTimer) {
            clearTimeout(searchTimeoutTimer);
        }

        _setSearch(query);

        const timer = setTimeout(() => {
            setQuery({
                search_query: query || undefined,
                page: 1,
            });
        }, 500);

        setSearchTimeoutTimer(timer);
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

    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         setQuery(q => ({
    //             ...q,
    //             search_query: search || undefined,
    //             page: 1,
    //         }));
    //     }, 500);
    //
    //     return () => clearTimeout(timer);
    // }, [search]);

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

        setPage,
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
                <input
                    className="max-w-sm border"
                    type="search"
                    placeholder="Search"
                    value={table.state.search}
                    onChange={(e) => table.setSearch(e.target.value)}
                />
                {resource.actions.length > 0 && (
                    <div className="ml-auto">
                        {resource.actions.map((action, index) => {
                            return (
                                <button
                                    disabled={table.state.selectedKeys.length < 1}
                                    onClick={() => handleAction(action)}
                                    key={index}
                                >
                                    {action.label}
                                </button>
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
                        </select>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 md:mt-0 md:ml-8">
                    <button
                        disabled={table.state.isFirstPage}
                        onClick={() => table.setPage(1)}
                        title="First page"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </button>

                    <button
                        disabled={table.state.isFirstPage}
                        onClick={() => table.setPage(resource.data.current_page - 1)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="px-2 text-sm text-muted-foreground">
                        Page {resource.data.current_page} of{' '}
                        {resource.data.last_page}
                    </div>

                    <button
                        disabled={table.state.isLastPage}
                        onClick={() => table.setPage(resource.data.current_page + 1)}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>

                    <button
                        disabled={table.state.isLastPage}
                        onClick={() => table.setPage(resource.data.last_page)}
                        title="Last page"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
