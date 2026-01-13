<?php

declare(strict_types=1);

namespace Eklundlabs\InertiaDatatable\Columns;

use Eklundlabs\InertiaDatatable\Abilities;
use Eklundlabs\InertiaDatatable\Column;
use Illuminate\Database\Eloquent\Model;

class TextColumn extends Column
{
    /**
     * @var array<class-string>
     */
    public $abilities = [
        Abilities\LinkAbility::class,
    ];

    public function toDatatableRow(Model $row): array
    {
        return [
            'value' => $row->getAttribute($this->name()),
        ];
    }
}
