import { Link, router } from "@inertiajs/react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
  DataTableAction,
  DataTableCell,
  DataTableQuery,
  DataTableResource,
  DataTableRow,
} from "./index";
import { ColumnTypeRenderers, type ColumnType } from "./column-type-renderers";
import { useDataTable } from './table';
import classNames from 'classnames'

type ColumnRendererMap = Partial<Record<ColumnType, React.ComponentType<any>>>;

export type IconResolver = (
  name: string
) => React.ComponentType<any> | undefined;

export const DataTableContext = React.createContext<{
  iconResolver?: IconResolver;
} | null>(null);

export function useDataTableContext() {
  const ctx = React.useContext(DataTableContext);

  if (!ctx) {
    throw new Error(
      "useDataTableContext must be used within a DataTable"
    );
  }

  return ctx;
}

export function DataTable({
  resource,
  columnRenderers = {},
  iconResolver,
}: {
  resource: DataTableResource;
  columnRenderers?: ColumnRendererMap;
  iconResolver?: IconResolver;
}) {
  const table = useDataTable(resource);

  const handleAction = (action: DataTableAction, row: DataTableRow|null) => {
    const confirmation =
      action.confirmable && action.confirmable.required
        ? confirm(action.confirmable.text)
        : true;

    if (!confirmation) {
      return;
    }

    const keys = row ? [row.id] : table.state.selectedKeys;

    router.post(
      action.url,
      { keys },
      {
        onSuccess: () => {
          if (action.isLink) return

          table.setSelectedKeys([]);

          alert("Success!");
        },
      },
    );
  };

  const toggleSelectAll = (checked: string | boolean) => {
    checked
      ? table.setSelectedKeys(resource.data.data.map((row) => row.id))
      : table.setSelectedKeys([]);
  };

  return (
    <DataTableContext.Provider value={{ iconResolver }}>
      <div className="relative">
        {table.state.isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-100/30"></div>
        )}

        <div className="flex flex-col justify-between md:flex-row md:items-center md:space-x-4 mb-4">
          {resource.columns.filter(c => c.searchable).length > 0 && (
            <input
              className="w-full md:max-w-md border rounded-md px-3 py-1.5 text-sm"
              type="search"
              placeholder="Search"
              value={table.state.search}
              onChange={(e) => table.setSearch(e.target.value)}
            />
          )}
          {resource.actions.filter(a => a.isBulk).length > 0 && (
            <div className="ml-auto">
              {resource.actions.filter(a => a.isBulk).map((action, index) => {
                return (
                  <button
                    disabled={table.state.selectedKeys.length < 1}
                    onClick={() => handleAction(action)}
                    key={index}
                    className="border rounded-md px-3 py-1.5 font-medium text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
                  >
                    {action.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <table className="relative min-w-full divide-y divide-gray-300 dark:divide-white/15">
          <thead>
            <tr>
              {resource.actions.filter(a => a.isBulk).length > 0 && (
                <th className="w-8 px-3.5">
                  <input
                    type="checkbox"
                    checked={table.state.allRowsAreSelected}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                  />
                </th>
              )}

              {resource.columns.map((column, index) => {
                return (
                  <th key={index} className="px-3.5 py-4 text-left">
                    {column.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-white/10">
            {resource.data.data.length === 0 ? (
              <tr className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400">
                <td
                  colSpan={resource.columns.length + 1}
                  className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 dark:text-gray-400"
                >
                  <p>No results found</p>
                </td>
              </tr>
            ) : (
              resource.data.data.map((row, index) => (
                <tr key={index}>
                  {resource.actions.filter(a => a.isBulk).length > 0 && (
                    <td className="w-8 px-3.5 py-4">
                      <input
                        type="checkbox"
                        checked={table.state.selectedKeys.includes(row.id)}
                        onChange={(e) =>
                          e.target.checked
                            ? table.selectRow(row)
                            : table.deselectRow(row)
                        }
                      />
                    </td>
                  )}

                  {resource.columns.map((column) => {
                    const _column = row[column.column];
                    const ColumnComponent =
                      columnRenderers[column.type] ??
                      ColumnTypeRenderers[column.type];
                    return (
                      <td className="px-3.5 py-4" key={column.column}>
                        <ColumnComponent column={column} data={_column} />
                      </td>
                    );
                  })}

                  <td className="text-right space-x-2">
                    <div className="flex gap-1.5 justify-end">
                      {resource.actions.map((action, index) => {
                        const Icon = iconResolver?.(action.icon?.name ?? "");

                        return (
                          <button
                            key={index}
                            onClick={() => handleAction(action, row)}
                            className={classNames(
                              'inline-flex items-center gap-1.5 border rounded-sm bg-white px-3 py-1 font-medium text-xs border-gray-300',
                              {
                                'cursor-pointer': true
                              }
                            )}
                          >
                            {Icon && <Icon className="h-3 w-3" />}
                            {action.name}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="mt-4 items-center justify-between md:flex">
          <div className="flex flex-1">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {resource.data.from} - {resource.data.to} of{" "}
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
              Page {resource.data.current_page} of {resource.data.last_page}
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
    </DataTableContext.Provider>
  );
}
