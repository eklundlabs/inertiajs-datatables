<?php
declare(strict_types=1);

namespace Eklundlabs\InertiaDatatable;

use Closure;

class Action
{
    public string $key;

    public bool $requireConfirmation = false;

    public string $confirmationText = '';

    final private function __construct(
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

    public function requireConfirmation(string $confirmationText): static
    {
        $this->requireConfirmation = true;
        $this->confirmationText = $confirmationText;

        return $this;
    }

    public function toResponse(): array
    {
        return [
            'name' => $this->getKey(),
            'label' => $this->label,
            'require_confirmation' => $this->requireConfirmation,
            'confirmation_text' => $this->confirmationText,
        ];
    }
}
