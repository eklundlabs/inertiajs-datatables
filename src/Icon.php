<?php

namespace Eklundlabs\InertiaDatatable;

use Illuminate\Contracts\Support\Arrayable;

class Icon implements Arrayable
{
    public function __construct(public string $name) {}

    public function toArray()
    {
        return ['name' => $this->name];
    }
}
