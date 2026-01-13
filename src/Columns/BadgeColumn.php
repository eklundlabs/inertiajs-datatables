<?php

declare(strict_types=1);

namespace Eklundlabs\InertiaDatatable\Columns;

use Eklundlabs\InertiaDatatable\Column;
use Illuminate\Database\Eloquent\Model;

class BadgeColumn extends Column
{
    public function value(mixed $value): mixed
    {
        return $value;

        return $this->mappings[$value];
    }

    public function toDatatableRow(Model $row): array
    {
        return [
            'value' => '',
        ];
    }
}
