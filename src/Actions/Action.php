<?php

declare(strict_types=1);

namespace Eklundlabs\InertiaDatatable\Actions;

use Eklundlabs\InertiaDatatable\Action as BaseAction;
use Eklundlabs\InertiaDatatable\Concerns\Action\Confirmable;

class Action extends BaseAction
{
    use Confirmable;
}
