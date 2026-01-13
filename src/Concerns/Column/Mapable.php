<?php

declare(strict_types=1);

namespace Eklundlabs\InertiaDatatable\Concerns\Column;

use Closure;

trait Mapable
{
    /** @var array<string, string> $mappings */
    public array $mappings = [];

    /**
     * @param array<string, string> $mappings
     */
    public function map(array $mappings): static
    {
        $this->mappings = $mappings;

        return $this;
    }

    /**
     * @return void
     */
    public function mapableUpdateValue(): void
    {
        if (count($this->mappings) && isset($this->mappings[$this->value])) {
            $this->value = $this->mappings[$this->value];
        }
    }
}
