<?php

declare(strict_types=1);

namespace Eklundlabs\InertiaDatatable;

use Eklundlabs\InertiaDatatable\Contracts\ColumnInterface;
use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * @property null|string $url
 */
abstract class Column implements Arrayable, ColumnInterface
{
    public bool $searchable = false;

    public array $attributes = [];

    public mixed $value;

    public $link;

    public $icon;

    public array $mappings = [];

    public array $iconMappings = [];

    public function toDatatableRow(Model $row): array
    {
        return [
            'value' => $row->getAttribute($this->name()),
        ];
    }

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

    public function hasAbility(string $ability)
    {
        $abilities = collect($this->abilities)
            ->filter(fn ($a) => Str::afterLast($a, '\\') == $ability);

        dd($abilities->sole());

        dd(array_filter($this->abilities, fn ($a) => Str::afterLast($a, '\\') == $ability));

        return in_array($ability, class_uses($this), true);
    }

    public function applyMappings(): void
    {
        $mappings = $this->mappings;

        if (count($mappings) && isset($mappings[$this->value])) {
            $this->value = $mappings[$this->value];
        }
    }

    public function map(array $mappings): static
    {
        $this->mappings = $mappings;

        return $this;
    }

    public function mapIcon(array $iconMappings): static
    {
        $this->iconMappings = $iconMappings;

        return $this;
    }

    public function __call(string $name, array $arguments): mixed
    {
        $abilityName = str($name)
            ->append('Ability')
            ->pascal()
            ->toString();

        dd($this->hasAbility($abilityName));

        dd(str($name)->append('Ability')->pascal(), $arguments);
    }

    public function forRow(Model $row): array
    {
        $rawValue = $row->getAttribute($this->name());

        $this->value = $rawValue;

        foreach ($this->abilities as $ability) {
            $ability = app()->make($ability);

            dd($ability);
        }

        $this->applyMappings();

        return [
            'value' => $this->value,
            'icon' => 'badge-check',
        ];
    }

    public function toArray(): array
    {
        return [
            'column' => $this->column,
            'label' => $this->label,
            'type' => class_basename(static::class),
            // "attributes" => $this->attributes(),
        ];
    }
}
