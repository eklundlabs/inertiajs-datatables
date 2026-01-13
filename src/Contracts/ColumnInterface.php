<?php

namespace Eklundlabs\InertiaDatatable\Contracts;

interface ColumnInterface
{
    /**
     * @param string $column
     */
    public function __construct(string $column, string $label);

    /**
     * @param mixed $value
     */
    public function value(mixed $value): mixed;
}
