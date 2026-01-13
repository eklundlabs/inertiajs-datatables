<?php

declare(strict_types=1);

namespace Eklundlabs\InertiaDatatable;

use Eklundlabs\InertiaDatatable\Contracts\ColumnInterface;
use Illuminate\Contracts\Support\Arrayable;

/**
 * @property null|string $url
 */
abstract class Column implements Arrayable, ColumnInterface
{
    public bool $searchable = false;

    public array $attributes = [];

    public function __construct(public string $column, public string $label) {}

    public static function make(string $column, string $label): static
    {
        return new static($column, $label);
    }

    public function searchable(): static
    {
        $this->searchable = true;

        return $this;
    }

    public function name(): string
    {
        return $this->column;
    }

    public function value(mixed $value): mixed
    {
        return $value;
    }

    public function setAttribute(string $key, mixed $value): static
    {
        $this->attributes[$key] = $value;
        return $this;
    }

    public function attributes()
    {
        return $this->attributes;
    }

    public function toArray(): array
    {
        return [
            "column" => $this->column,
            "label" => $this->label,
            "type" => class_basename(static::class),
        ];
    }
}
