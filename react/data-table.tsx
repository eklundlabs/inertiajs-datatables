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
import React, { useEffect, useMemo, useState } from 'react';
import { DataTableAction, DataTableCell, DataTableResource, DataTableRow } from './index';

export function useDataTable(resource: DataTableResource) {
    const [searchQuery, setSearchQuery] = useState(resource.searchQuery ?? '');

    const isFirstPage = resource.data.current_page === 1;
    const isLastPage = resource.data.current_page === resource.data.last_page;

    const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    return {
        state: {
            isFirstPage,
            isLastPage,
            selectedKeys,
            isLoading,
            searchQuery,
        },

        setSearchQuery,
        setSelectedKeys,
        setIsLoading,
    }
}

export function DataTable({ resource }: { resource: DataTableResource }) {
    const dataTable = useDataTable(resource);

    const allKeysSelected = useMemo(() => {
        const allRowIds = resource.data.data.map((row) => row.id);
        return (
            allRowIds.length > 0 &&
            allRowIds.every((id) => dataTable.state.selectedKeys.includes(id))
        );
    }, [dataTable.state.selectedKeys, resource.data.data]);

    const getCurrentParams = (): Record<string, string | number> => {
        const currentParams = new URLSearchParams(window.location.search);
        const allParams: Record<string, string | number> = {};
        currentParams.forEach((value, key) => {
            allParams[key] = value;
        });
        return allParams;
    };

    const updateTable = (params: Record<string, string | number> = {}) => {
        dataTable.setIsLoading(true);

        const allParams = getCurrentParams();

        router.get(
            window.location.pathname,
            { ...allParams, ...params } as Record<string, string | number>,
            {
                preserveState: true,
                preserveScroll: true,
                onBefore: () => {
                    dataTable.setIsLoading(true);
                },
                onSuccess: () => {
                    dataTable.setIsLoading(false);
                },
            },
        );
    };

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
                keys: dataTable.state.selectedKeys,
            },
            {
                onSuccess: () => {
                    dataTable.setSelectedKeys([]);
                },
            },
        );
    };

    const handleRowSelection = (
        checked: string | boolean,
        row: DataTableRow,
    ) => {
        if (checked) {
            dataTable.setSelectedKeys([...dataTable.state.selectedKeys, row.id]);
        } else {
            dataTable.setSelectedKeys(dataTable.state.selectedKeys.filter((key: string|number) => key !== row.id));
        }
    };

    const toggleSelectAll = (checked: string | boolean) => {
        checked ? dataTable.setSelectedKeys(
            resource.data.data.map((row) => row.id)
        ) : dataTable.setSelectedKeys([]);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            const allParams = getCurrentParams();

            if (dataTable.state.searchQuery) {
                allParams['search_query'] = dataTable.state.searchQuery;
            } else {
                delete allParams['search_query'];
            }

            router.get(
                window.location.pathname,
                { ...allParams } as Record<string, string | number>,
                {
                    preserveState: true,
                    preserveScroll: true,
                    onBefore: () => {
                        dataTable.setIsLoading(true);
                    },
                    onSuccess: () => {
                        dataTable.setIsLoading(false);
                    },
                },
            );
        }, 500);

        return () => clearTimeout(timer);
    }, [dataTable.state.searchQuery]);

    return (
        <div className="relative">
            {dataTable.state.isLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-100/30"></div>
            )}

            <div className="mb-4 flex">
                <Input
                    className="max-w-sm"
                    type="search"
                    placeholder="Search"
                    value={dataTable.state.searchQuery}
                    onChange={(e) => dataTable.setSearchQuery(e.target.value)}
                />
                {resource.actions.length > 0 && (
                    <div className="ml-auto">
                        {resource.actions.map((action, index) => {
                            return (
                                <Button
                                    disabled={dataTable.state.selectedKeys.length < 1}
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
                                checked={allKeysSelected}
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
                                        checked={dataTable.state.selectedKeys.includes(row.id)}
                                        onChange={(e) =>
                                            handleRowSelection(e.target.value, row)
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
                        <Select
                            value={
                                resource.data.per_page.toString() ??
                                resource.perPageOptions[0].toString()
                            }
                            onValueChange={(value) =>
                                updateTable({ per_page: value, page: 1 })
                            }
                        >
                            <SelectTrigger className="w-[70px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {resource.perPageOptions.map(
                                    (perPageOption) => (
                                        <SelectItem
                                            key={perPageOption}
                                            value={perPageOption.toString()}
                                        >
                                            {perPageOption}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 md:mt-0 md:ml-8">
                    <Button
                        variant="outline"
                        size="icon"
                        disabled={dataTable.state.isFirstPage}
                        onClick={() => updateTable({ page: 1 })}
                        title="First page"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        disabled={dataTable.state.isFirstPage}
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
                        disabled={dataTable.state.isLastPage}
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
                        disabled={dataTable.state.isLastPage}
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
