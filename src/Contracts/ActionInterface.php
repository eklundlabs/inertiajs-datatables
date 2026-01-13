<?php

declare(strict_types=1);

namespace Eklundlabs\InertiaDatatable\Contracts;

use Closure;

interface ActionInterface
{
    /**
     * @param string $label
     * @param Closure $handle
     */
    public function __construct(string $label, Closure $handle);

    /**
     * @param string $label
     * @param callable $handle
     */
    public static function make(string $label, callable $handle): static;
}
