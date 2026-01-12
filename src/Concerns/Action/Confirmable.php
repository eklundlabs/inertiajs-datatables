<?php

namespace Eklundlabs\InertiaDatatable\Concerns\Action;

trait Confirmable
{
    public bool $confirmationIsRequired = false;

    public string $confirmationText = 'Are you sure you want to continue?';

    public function confirm(string $text): static
    {
        $this->confirmationText = $text;
        $this->confirmationIsRequired = true;

        return $this;
    }

    public function confirmableToArray(): array
    {
        return [
            'required' => true,
            'text' => $this->confirmationText,
        ];
    }
}
