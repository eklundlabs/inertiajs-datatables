import { useState, useMemo, useEffect } from 'react';
import { router } from '@inertiajs/react';

export function useDataTable(resource: DataTableResource) {
  const [search, _setSearch] = useState<string>(resource.searchQuery ?? "");
  const [searchTimeoutTimer, setSearchTimeoutTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const [perPage, _setPerPage] = useState<string | number>(
    resource.data.per_page,
  );

  const isFirstPage = resource.data.current_page === 1;
  const isLastPage = resource.data.current_page === resource.data.last_page;

  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const URLParams = new URLSearchParams(window.location.search);

  const [query, _setQuery] = useState<DataTableQuery>({
    page: URLParams.get("page") ?? undefined,
    per_page: URLParams.get("per_page") ?? undefined,
    search: URLParams.get("search") ?? undefined,
  });

  const setQuery = (query: { [key: string]: number | string | undefined }) => {
    _setQuery((q) => ({
      ...q,
      ...query,
    }));
  };

  const allRowsAreSelected = useMemo(() => {
    const allRowIds = resource.rows.map((row) => row.id);
    return (
      allRowIds.length > 0 && allRowIds.every((id) => selectedKeys.includes(id))
    );
  }, [selectedKeys]);

  const setPerPage = (per_page: number | string) => {
    _setPerPage(per_page);

    setQuery({
      per_page: per_page,
      page: 1,
    });
  };

  const setPage = (page: number | string) => {
    setQuery({ page });
  };

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
  };

  const selectRow = (row: DataTableRow) => {
    setSelectedKeys([...selectedKeys, row.id]);
  };

  const deselectRow = (row: DataTableRow) => {
    setSelectedKeys(
      selectedKeys.filter((key: string | number) => key !== row.id),
    );
  };

  const updateTable = () => {
    setIsLoading(true);

    router.get(window.location.pathname, query, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
      onFinish: () => {
        setIsLoading(false);
      },
    });
  };

  useEffect(() => {
    updateTable();
  }, [query]);

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
  };
}
