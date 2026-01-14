<?php

declare(strict_types=1);

namespace Eklundlabs\InertiaDatatable;

use Closure;
use Eklundlabs\InertiaDatatable\Contracts\ActionInterface;
use Exception;
use Illuminate\Contracts\Support\Arrayable;

abstract class Action implements ActionInterface, Arrayable
{
    public ?string $signedActionUrl = null;

    public bool $isBulk = false;

    public bool $isLink = false;

    public ?Icon $icon = null;

    public function __construct(
        public string $name,
        protected Closure $handle
    ) {}

    public static function make(string $name, callable $handle): static
    {
        return new static(
            $name,
            $handle instanceof Closure ? $handle : $handle(...)
        );
    }

    public function sign(Table $table): static
    {
        $tableBase64Encoded = base64_encode(get_class($table));

        $signature = hash_hmac(
            'sha256',
            $tableBase64Encoded.'|'.base64_encode($this->name),
            config('app.key')
        );

        $this->signedActionUrl = route('inertiajs-datatables.actions', [
            'table' => $tableBase64Encoded,
            'action' => base64_encode($this->name),
            'signature' => $signature,
        ]);

        return $this;
    }

    public function asLink()
    {
        $this->isLink = true;

        return $this;
    }

    public function asBulk()
    {
        $this->isBulk = true;

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

        if (!$this->isLink && method_exists($this, 'confirmableToArray')) {
            $response['confirmable'] = $this->confirmableToArray();
        }

        return [
            'name' => $this->name,
            'url' => $this->signedActionUrl,
            'isBulk' => $this->isBulk,
            'isLink' => $this->isLink,
            'icon' => $this->icon,
            ...$response,
        ];
    }

    public function icon(string|Icon $icon)
    {
        $this->icon = $icon instanceof Icon ?: new Icon($icon);
        return $this;
    }

    public function handle(mixed $model): mixed
    {
        return ($this->handle)($model);
    }
}
