<?php

namespace Eklundlabs\InertiaDataTable;

use Illuminate\Database\Eloquent\Model;
use Spatie\Searchable\Search;

abstract class Table
{
    protected ?string $resource = null;

    protected array $perPageOptions = [10, 25, 50, 100];

    abstract public function columns(): array;

    abstract public function actions(): array;

    public static function make(): array
    {
        return (new static())->toResponse();
    }

    public function getAction(string $key): ?Action
    {
        return collect($this->actions())->first(fn ($action) => $action->getKey() === $key);
    }

    private function resourceResolved(): mixed
    {
        return app($this->resource);
    }

    public function executeAction(Action $action, array $keys = []): void
    {
        foreach ($keys as $key) {
            $model = $this->resourceResolved()->find($key);

            if ($model) {
                $action->handle($model);
            }
        }
    }

    public function toResponse(): array
    {
        $resource = app($this->resource);

        $databaseColumnsToSelect = collect($this->columns())
            ->map(fn (Column $column) => $column->name())
            ->all();

        $searchableColumns = collect($this->columns())
            ->filter(fn (Column $column) => $column->searchable)
            ->pluck(fn (Column $column) => $column->name());

        $query = $resource->query();

        if (request('search_query') && count($searchableColumns)) {
            $s = (new Search())
                    ->registerModel(get_class($resource), $searchableColumns->toArray())
                    ->limitAspectResults(100)
                    ->search(request('search_query'));

            $query->whereIn('id', $s->map->searchable->pluck('id')->toArray());
        }

        $paginator = $query->select(['id', ...$databaseColumnsToSelect])->paginate(request('per_page') ?? $this->perPageOptions[0]);

        $paginatorArray = $paginator->toArray();
        $paginatorArray['data'] = $this->transformRows($paginator->items());

        return [
            'table' => base64_encode(get_class($this)),
            'rows' => $paginatorArray['data'],
            'columns' => array_map(fn ($column) => $column->toResponse(), $this->columns()),
            'actions' => array_map(fn ($action) => $action->toResponse(), $this->actions()),
            'perPageOptions' => $this->perPageOptions,
            'searchQuery' => request('search_query'),
            'data' => $paginatorArray,
        ];
    }

    /**
     * @param array<Model> $rows
     * @return array
     */
    protected function transformRows(array $rows): array
    {
        return array_map(function ($row) {
            $transformed = ['id' => $row->id];

            foreach ($this->columns() as $column) {
                $columnName = $column->name();

                $transformed[$columnName] = [
                    'value' => $row->$columnName,
                    'url'   => method_exists($column, 'resolveUrl') ? $column->resolveUrl($row) : null,
                ];
            }

            return $transformed;
        }, $rows);
    }
}
