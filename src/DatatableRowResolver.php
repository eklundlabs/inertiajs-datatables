<?php

namespace Eklundlabs\InertiaDatatable;

use Illuminate\Database\Eloquent\Model;

class DatatableRowResolver
{
    /** @var mixed */
    public $originalRowValue;

    public function resolve(Model $row, Column $column): array
    {
        $this->originalRowValue = $row[$column->column];

        $response = [
            'value' => $row[$column->column],
            'icon' => null,
            'link' => null,
        ];

        if (count($column->mappings) && isset($column->mappings[$this->originalRowValue])) {
            $response['value'] = $column->mappings[$this->originalRowValue];
        }

        if (count($column->iconMappings) && isset($column->iconMappings[$this->originalRowValue])) {
            $icon = $column->iconMappings[$this->originalRowValue];

            $iconClass = is_string($icon) ? new Icon($icon) : $column->iconMappings[$this->originalRowValue];

            $response['icon'] = $iconClass->toArray();
        }

        return $response;
    }
}
