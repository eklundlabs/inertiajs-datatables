<?php

declare(strict_types=1);

namespace Eklundlabs\InertiaDatatable\Columns;

use Eklundlabs\InertiaDatatable\Column;
use Eklundlabs\InertiaDatatable\Concerns\Column\Linkable;
use Eklundlabs\InertiaDatatable\Concerns\Column\Mapable;
use Illuminate\Database\Eloquent\Model;

class BadgeColumn extends Column
{
    /**
     * @param mixed $value
     */
    public function value(mixed $value): mixed
    {
        return $value;
        return $this->mappings[$value];
    }

    /**
     * @param Model $row
     * @return array
     */
    public function toDatatableRow(Model $row): array
    {
        return [
            'value' => ''
        ];
    }
}
