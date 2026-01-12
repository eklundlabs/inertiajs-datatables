<?php

declare(strict_types=1);

namespace Eklundlabs\InertiaDatatable\Concerns;

use Closure;

trait URLAble
{
    protected ?Closure $urlResolver = null;

    public function url(Closure $urlResolver): static
    {
        $this->urlResolver = $urlResolver;

        return $this;
    }

    public function resolveUrl(mixed $row): ?array
    {
        if (! $this->urlResolver) {
            return null;
        }

        return ['link' => ($this->urlResolver)($row)];
    }
}
