<?php

declare(strict_types=1);

namespace Eklundlabs\InertiaDatatable\Contracts;

use Closure;

interface ActionInterface
{
    public function __construct(string $label, Closure $handle);

    public static function make(string $label, callable $handle): static;
}
