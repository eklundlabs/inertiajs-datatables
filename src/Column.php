<?php

declare(strict_types=1);

namespace Eklundlabs\InertiaDatatable;

use Eklundlabs\InertiaDatatable\Contracts\ColumnInterface;
use Illuminate\Contracts\Support\Arrayable;

abstract class Column implements Arrayable, ColumnInterface
{
    public bool $searchable = false;

    public array $attributes = [];

    public mixed $value;

    public $link;

    public $icon;

    public array $mappings = [];

    public array $iconMappings = [];

    /**
     * @var string
     * @var string
     *
     * @return void
     */
    public function __construct(public string $column, public string $label) {}

    /**
     * @var string
     * @var string
     */
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

    public function map(array $mappings): static
    {
        $this->mappings = $mappings;

        return $this;
    }

    /**
     * @var array
     */
    public function mapIcon(array $iconMappings): static
    {
        $this->iconMappings = $iconMappings;

        return $this;
    }

    public function toArray(): array
    {
        return [
            'column' => $this->column,
            'label' => $this->label,
            'type' => class_basename(static::class),
        ];
    }
}
