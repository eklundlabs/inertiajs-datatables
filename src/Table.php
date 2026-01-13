<?php

declare(strict_types=1);

namespace Eklundlabs\InertiaDatatable;

use Exception;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Database\Eloquent\Model;

abstract class Table implements Arrayable
{
    /** @var class-string<Model>|null */
    protected ?string $resource = null;

    /** @var array<int> */
    protected array $perPageOptions = [10, 25, 50, 100];

    public static function make(): static
    {
        return app(static::class);
    }

    public function getAction(string $key): ?Action
    {
        return collect($this->actions())->first(
            fn($action) => $action->name === base64_decode($key),
        );
    }

    private function resourceResolved(): mixed
    {
        return app($this->resource);
    }

    abstract public function columns(): array;

    abstract public function actions(): array;

    public function executeAction(Action $action, array $keys = []): void
    {
        foreach ($keys as $key) {
            $model = $this->resourceResolved()->find($key);

            if ($model) {
                $action->handle($model);
            }
        }
    }

    public function toArray(): array
    {
        $resource = app($this->resource);

        $databaseColumnsToSelect = collect($this->columns())
            ->map(fn(Column $column) => $column->name())
            ->all();

        $searchableColumns = collect($this->columns())
            ->filter(fn(Column $column) => $column->searchable)
            ->pluck("column");

        $query = $resource->query();

        if (request("search_query") && count($searchableColumns)) {
            if (method_exists($this, "searchUsing")) {
                $query = app()->call(
                    [$this, "searchUsing"],
                    [
                        "builder" => $query,
                        "search" => request("search_query"),
                        "searchableColumns" => $searchableColumns,
                    ],
                );
            } else {
                foreach ($searchableColumns as $column) {
                    $query = $query->orWhere(
                        $column,
                        "like",
                        "%" . request("search_query") . "%",
                    );
                }
            }
        }

        $paginator = $query
            ->select(["id", ...$databaseColumnsToSelect])
            ->paginate(request("per_page") ?? $this->perPageOptions[0]);

        $paginatorArray = $paginator->toArray();
        $paginatorArray["data"] = $this->transformRows($paginator->items());

        return [
            "table" => base64_encode(get_class($this)),
            "rows" => $paginatorArray["data"],
            "columns" => $this->toArrayable($this->columns()),
            "actions" => $this->toArrayable(
                $this->signActions($this->actions()),
            ),
            "perPageOptions" => $this->perPageOptions,
            "searchQuery" => request("search_query"),
            "data" => $paginatorArray,
        ];
    }

    public function signActions(array $actions): array
    {
        return array_map(fn(Action $action) => $action->sign($this), $actions);
    }

    private function toArrayable(array $items): array
    {
        return array_map(fn($item) => $item->toArray(), $items);
    }

    /**
     * @param  array<Model>  $rows
     *
     * @throws Exception
     */
    protected function transformRows(array $rows): array
    {
        return array_map(function ($row) {
            if (!isset($row->id)) {
                throw new \Exception("Row id is required.");
            }

            $transformed = ["id" => $row->id];

            foreach ($this->columns() as $column) {
                $formatter = new DatatableRowResolver();

                $transformed[$column->name()] = $formatter->resolve($row, $column);
            }

            return $transformed;
        }, $rows);
    }
}
