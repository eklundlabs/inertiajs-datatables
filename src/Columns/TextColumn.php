<?php

declare(strict_types=1);

namespace Eklundlabs\InertiaDatatable\Columns;

use Eklundlabs\InertiaDatatable\Column;
use Illuminate\Database\Eloquent\Model;
use Eklundlabs\InertiaDatatable\Abilities;
use Eklundlabs\InertiaDatatable\Concerns\Column\Linkable;

class TextColumn extends Column
{
    /**
     * @var array<class-string> $abilities
     */
    public $abilities = [
        Abilities\LinkAbility::class
    ];

    /**
     * @param Model $row
     * @return array
     */
    public function toDatatableRow(Model $row): array
    {
        return [
            'value' => $row->getAttribute($this->name()),
        ];
    }
}
