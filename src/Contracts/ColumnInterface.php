<?php

namespace Eklundlabs\InertiaDatatable\Contracts;

interface ColumnInterface
{
    public function __construct(string $column, string $label);

    public function value(mixed $value): mixed;
}
