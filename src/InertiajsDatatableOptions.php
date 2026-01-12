<?php

declare(strict_types=1);

namespace Eklundlabs\InertiaDatatable;

class InertiajsDatatableOptions
{
    public static bool $actionsIsEnabled = true;

    public static function disableActions(): void
    {
        self::$actionsIsEnabled = true;
    }

    public static function actionsIsEnabled(): bool
    {
        return self::$actionsIsEnabled;
    }
}
