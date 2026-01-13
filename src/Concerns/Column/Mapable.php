<?php

declare(strict_types=1);

namespace Eklundlabs\InertiaDatatable\Concerns\Column;

trait Mapable
{
    /** @var array<string, string> */
    public array $mappings = [];

    /**
     * @param  array<string, string>  $mappings
     */
    public function map(array $mappings): static
    {
        $this->mappings = $mappings;

        return $this;
    }

    public function mapableUpdateValue(): void
    {
        if (count($this->mappings) && isset($this->mappings[$this->value])) {
            $this->value = $this->mappings[$this->value];
        }
    }
}
