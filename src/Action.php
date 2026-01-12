<?php

declare(strict_types=1);

namespace Eklundlabs\InertiaDatatable;

use Closure;
use Eklundlabs\InertiaDatatable\Contracts\ActionInterface;
use Exception;
use Illuminate\Contracts\Support\Arrayable;

abstract class Action implements ActionInterface, Arrayable
{
    public string $key;

    public ?string $signedActionUrl = null;

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

    public function sign(Table $table): static
    {
        $tableBase64Encoded = base64_encode(get_class($table));

        $signature = hash_hmac(
            'sha256',
            $tableBase64Encoded.'|'.$this->label,
            config('app.key')
        );

        $this->signedActionUrl = route('inertiajs-datatables.actions', [
            'table' => $tableBase64Encoded,
            'action' => $this->label,
            'signature' => $signature,
        ]);

        return $this;
    }

    /**
     * @throws Exception
     */
    public function toArray(): array
    {
        if (is_null($this->signedActionUrl)) {
            throw new Exception('Inertia datatable action has not been signed');
        }

        $response = [];

        if (method_exists($this, 'confirmableToArray')) {
            $response['confirmable'] = $this->confirmableToArray();
        }

        return [
            'name' => get_class($this),
            'label' => $this->label,
            'url' => $this->signedActionUrl,
            ...$response,
        ];
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
