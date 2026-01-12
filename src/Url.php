<?php

declare(strict_types=1);

namespace Eklundlabs\InertiaDatatable;

class Url
{
    final private function __construct(
        public string $url,
        public ?string $text = null
    ) {}

    public static function make(string $url, ?string $text = null): static
    {
        return new static($url, $text);
    }

    public function route(string $name, mixed $parameters = [], bool $absolute = true): static
    {
        $this->url = route($name, $parameters, $absolute);

        return $this;
    }

    public function text(string $text): static
    {
        $this->text = $text;

        return $this;
    }

    public function toArray(): array
    {
        return [
            'url' => $this->url,
            'text' => $this->text,
        ];
    }
}
