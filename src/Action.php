<?php

declare(strict_types=1);

namespace Eklundlabs\InertiaDatatable;

use Closure;
use Eklundlabs\InertiaDatatable\Contracts\ActionInterface;
use Illuminate\Contracts\Support\Arrayable;

abstract class Action implements ActionInterface, Arrayable
{
    public string $key;

    public function __construct(
        public string $label,
        protected Closure $handle
    ) {}

    public static function make(string $label, callable $handle): static
    {
        return new static(
            $label,
            $handle instanceof Closure ? $handle : $handle(...)
        );
    }

    public function toArray(): array
    {
        $response = [
            'name' => $this->getKey(),
            'label' => $this->label,
        ];

        if (method_exists($this, 'confirmableToArray')) {
            $response['confirmable'] = $this->confirmableToArray();
        }

        return $response;
    }

    public function key(string $key): static
    {
        $this->key = $key;

        return $this;
    }

    public function getKey(): string
    {
        return $this->key ?? str($this->label)->kebab()->toString();
    }

    public function handle(mixed $model): mixed
    {
        return ($this->handle)($model);
    }
}
