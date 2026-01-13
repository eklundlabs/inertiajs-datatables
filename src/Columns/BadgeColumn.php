<?php

declare(strict_types=1);

namespace Eklundlabs\InertiaDatatable\Columns;

use Eklundlabs\InertiaDatatable\Column;
use Eklundlabs\InertiaDatatable\Concerns\Column\Linkable;

class BadgeColumn extends Column
{
    use Linkable;

    /** @var array<string, string> $mappings */
    public array $mappings = [];

    public array $iconMappings = [];

    /**
     * @param array<string, string> $mappings
     */
    public function map(array $mappings): static
    {
        $this->mappings = $mappings;

        return $this;
    }

    /**
     * @param array $iconMappings
     */
    public function mapIcons(array $iconMappings): static
    {
        $this->setAttribute("iconMappings", $iconMappings);

        return $this;
    }

    /**
     * @param mixed $value
     */
    public function value(mixed $value): mixed
    {
        return $this->mappings[$value];
    }
}
